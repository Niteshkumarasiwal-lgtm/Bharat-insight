"use client";
import { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("health");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

   useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((res) => {
        const bigData = [];
        const repeat = dept === "health" ? 200 : 100;
        for (let i = 0; i < repeat; i++) {
          bigData.push(...res);  }
          setData(bigData);   });
             }, [dept]);
   
const askAI = async () => {
try {
 const res = await fetch("/api/ai", {
   method: "POST",
    headers: {
   "Content-Type": "application/json",  },
      body: JSON.stringify({
        prompt: `
          Data: ${JSON.stringify(data.slice(0, 20))}
          Question: ${question} `,
      }),
    });

    const result = await res.json();

    const text =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response mila";

    setAnswer(text);}
      catch (err) {
       console.error(err);
        setAnswer("retry");
  }
};
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl mb-4"> Dashboard</h1>
    <select
  className="bg-white text-black p-2 mb-4 border rounded"
   onChange={(e) => setDept(e.target.value)}>
    <option value="health">Health</option>
    <option value="agriculture">Agriculture</option>
</select>

      <input
        placeholder="Search user..."
          className="p-2 mb-4 bg-white text-black border rounded"
           onChange={(e) => setSearch(e.target.value)}/>
      <p className="mb-2">Total Records: {data.length}</p>
      <div className="overflow-auto h-[400px] border">
        <table className="w-full border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">City</th>
            </tr>
          </thead>

          <tbody>
            {data
              .filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((item, i) => (
                <tr key={i} className="text-center border-t">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.email}</td>
                  <td className="p-2">{item.address.city}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h2 className="text-xl mb-2">Ask AI</h2>

        <input
          placeholder="Ask something..."
           className="p-2 bg-white text-black border rounded"
            onChange={(e) => setQuestion(e.target.value)}/>
        
        <button
          onClick={askAI}
           className="ml-2 bg-white text-black px-4 py-2">
          Ask
        </button>
        <p className="mt-3">{answer}</p>
       </div>
    </div>
    );}