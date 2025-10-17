export default function Math210Page() {
    return (
      <div className="flex min-h-screen bg-white text-black">
        <aside className="w-64 border-r border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-8">Edu-Chatbot</h1>
            <nav className="space-y-4">
              <a href="/" className="block font-medium hover:text-blue-600">
                Home
              </a>
              <a href="/shop" className="block font-medium hover:text-blue-600">
                Shop
              </a>
            </nav>
          </div>
          <div className="pt-6 border-t border-gray-200 mb-4">
            <a href="/profile" className="block font-medium text-black hover:text-blue-600">
              Profile
            </a>
          </div>
        </aside>
  
        <main className="flex-1 px-12 py-10">
          <h1 className="text-3xl font-bold mb-4">MATH 210 — Calculus III</h1>
          <p className="text-lg text-gray-700">Welcome to your Math 210 course page.</p>
        </main>
      </div>
    );
  }
  