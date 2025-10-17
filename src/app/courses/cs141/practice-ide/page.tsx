export default function PracticeIDEPage() {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col">
        {/* Top Navigation */}
        <header className="flex justify-between items-center px-10 py-4 border-b border-gray-200 bg-white shadow-sm">
          <a
            href="/courses/cs141"
            className="text-blue-600 font-medium hover:underline"
          >
            ← Back to CS 141
          </a>
          <h1 className="text-2xl font-bold">Practice IDE (C++)</h1>
          <div className="w-24" />
        </header>
  
        {/* IDE Embed */}
        <main className="flex-1 p-6">
          <iframe
            src="https://onecompiler.com/embed/cpp"
            width="100%"
            height="800"
            frameBorder="0"
            allow="clipboard-write"
            className="rounded-lg border"
          ></iframe>
        </main>
      </div>
    );
  }
  