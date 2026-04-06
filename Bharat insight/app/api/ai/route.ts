export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAC_K0Z3v5YyCkmShVpUnAhPLxZAuuLbJo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: body.prompt }],
          },
        ],
      }),
    }
  );
  const data = await res.json();
  return Response.json(data);
}