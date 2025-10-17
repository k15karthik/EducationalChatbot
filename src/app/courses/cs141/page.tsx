"use client";
import Link from "next/link";

export default function CS141Page() {
  const lessons = [
    { id: "lesson1", title: "Lesson 1: Variables and Data Types" },
    { id: "lesson2", title: "Lesson 2: Control Structures" },
    { id: "lesson3", title: "Lesson 3: Functions and Scope" },
  ];

  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Sidebar */}
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
          <a
            href="/profile"
            className="block font-medium text-black hover:text-blue-600"
          >
            Profile
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-12 py-10 space-y-8">
        <h1 className="text-3xl font-bold text-center">CS 141</h1>

        {/* Assignments */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Assignments</h2>
          <div className="border rounded-xl p-4 bg-gray-50">
            <p className="text-red-600 font-medium">8:00 AM Coding Test</p>
            <Link
              href="/courses/cs141/lesson1"
              className="block text-red-600 hover:underline"
            >
              Lesson 1: Variables and Data Types
            </Link>
          </div>
        </section>

        {/* Practice + Actions */}
        <section className="grid grid-cols-3 gap-6 mt-6">
          {/* Practice Skills with lessons inside */}
          <div className="col-span-2 border rounded-xl p-4 bg-gray-50 h-64 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-2">Practice Skills</h3>
            <ul className="space-y-2 mt-2">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/courses/cs141/${lesson.id}`}
                    className="block text-blue-600 hover:underline"
                  >
                    {lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column buttons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() =>
                (window.location.href = "/courses/cs141/practice-ide")
              }
              className="border rounded-xl py-3 font-medium hover:bg-gray-100"
            >
              Practice IDE
            </button>
            <button className="border rounded-xl py-3 font-medium hover:bg-gray-100">
              Practice Exam
            </button>
            <button
              onClick={() => (window.location.href = "/chat")}
              className="border rounded-xl py-3 font-medium hover:bg-gray-100"
            >
              Ask AI
            </button>
            <button className="border rounded-xl py-3 font-medium hover:bg-gray-100">
              Discussion
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
