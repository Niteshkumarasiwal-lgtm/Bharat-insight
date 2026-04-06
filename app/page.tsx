export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen flex flex-col items-center justify-center">
      
      <h1 className="text-5xl font-bold mb-4">
        Bharat Insight 🇮🇳
      </h1>

      <p className="text-gray-400 mb-6">
        Explore Indian Data with AI 🚀
      </p>

      <a href="/dashboard">
        <button className="bg-white text-black px-6 py-2 rounded-lg">
          Go to Dashboard
        </button>
      </a>

    </main>
  );
}