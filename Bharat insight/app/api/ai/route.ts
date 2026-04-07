import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalyticsRow, DepartmentId } from "@/lib/types";

type InsightRequest = {
  question: string;
  department: DepartmentId;
  filters: {
    query: string;
    state: string;
    year: string;
  };
  totalRows: number;
  stats: {
    averageValue: number;
    totalValue: number;
    bestState: string;
    bestStateValue: number;
  };
  sampleRows: AnalyticsRow[];
};

function toSseEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function buildPrompt(body: InsightRequest) {
  return `
You are Bharat Insight, an analytics copilot for Indian public sector dashboards.

Department: ${body.department}
User question: ${body.question}

Active filters:
- Search query: ${body.filters.query || "none"}
- State: ${body.filters.state || "All states"}
- Year: ${body.filters.year || "All years"}

Filtered dataset summary:
- Matching rows: ${body.totalRows}
- Average metric value: ${body.stats.averageValue}
- Total metric value: ${body.stats.totalValue}
- Best performing state: ${body.stats.bestState} (${body.stats.bestStateValue})

Sample rows:
${JSON.stringify(body.sampleRows, null, 2)}

Instructions:
- Answer like a senior analyst.
- Reference only the supplied context.
- Mention filter context when it changes the conclusion.
- Give 2-4 short insights plus 1 recommended action.
- Keep the response concise and executive-friendly.
`.trim();
}

function buildFallbackInsight(body: InsightRequest) {
  const scope = [
    body.filters.state && `state filter set to ${body.filters.state}`,
    body.filters.year && `year filter set to ${body.filters.year}`,
    body.filters.query && `search narrowed by "${body.filters.query}"`,
  ]
    .filter(Boolean)
    .join(", ");

  return [
    `I reviewed ${body.totalRows.toLocaleString()} filtered ${body.department} records.`,
    scope
      ? `The current view is constrained by ${scope}.`
      : "The current view covers the full active department slice.",
    `${body.stats.bestState} leads this slice with a benchmark value of ${body.stats.bestStateValue.toLocaleString()}.`,
    `The average metric value across the active results is ${body.stats.averageValue.toLocaleString()}, which suggests a steady but uneven regional spread.`,
    "Recommended action: investigate the gap between the leading state and the long tail, then prioritize programs that can be replicated quickly.",
  ].join(" ");
}

export async function POST(request: Request) {
  const body = (await request.json()) as InsightRequest;
  const encoder = new TextEncoder();
  const apiKey = process.env.GEMINI_API_KEY;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(toSseEvent(event, data)));
      };

      try {
        send("thinking", {
          text: `Inspecting ${body.totalRows.toLocaleString()} filtered records and comparing department performance patterns before drafting the summary.`,
        });

        if (!apiKey) {
          const fallback = buildFallbackInsight(body);
          for (const token of fallback.split(" ")) {
            send("token", { text: `${token} ` });
            await new Promise((resolve) => setTimeout(resolve, 35));
          }
          send("done", { source: "fallback" });
          controller.close();
          return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
        });
        const result = await model.generateContentStream(buildPrompt(body));

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            send("token", { text });
          }
        }

        send("done", { source: "gemini" });
        controller.close();
      } catch (error) {
        send("error", {
          message:
            error instanceof Error
              ? error.message
              : "Insight streaming failed.",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
