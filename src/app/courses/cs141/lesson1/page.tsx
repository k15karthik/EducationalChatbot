import Link from "next/link";

export default function Lesson1Page() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Top Navbar */}
      <header className="flex justify-between items-center px-10 py-4 border-b border-gray-200 bg-white shadow-sm">
        <Link
          href="/courses/cs141"
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back to CS 141
        </Link>
        <h1 className="text-2xl font-bold">Edu-Chatbot</h1>
        <div className="w-24" /> {/* spacer for symmetry */}
      </header>

      {/* Lesson Content */}
      <main className="flex-1 px-16 py-10 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Lesson 1: Variables and Data Types</h2>

        <section className="text-lg text-gray-700 leading-relaxed space-y-4">
          <p>
            In this lesson, you will learn about variables, data types, and how they are used to
            store information in programs. A <strong>variable</strong> is a named storage location
            for data that can be modified during program execution.
          </p>

          <p>
            Common data types include:
            <ul className="list-disc list-inside mt-2">
              <li><strong>int</strong> — for integer numbers</li>
              <li><strong>double</strong> — for decimal numbers</li>
              <li><strong>char</strong> — for single characters</li>
              <li><strong>string</strong> — for sequences of characters</li>
              <li><strong>bool</strong> — for true/false values</li>
            </ul>
          </p>

          <p>
            Example:
          </p>
          <pre className="bg-gray-100 rounded-lg p-4 text-sm font-mono border">
{`int age = 20;
string name = "Alice";
bool isStudent = true;`}
          </pre>

          <p>
            Try writing a simple program that declares a few variables and prints their values to the console.
          </p>
        </section>
      </main>
    </div>
  );
}
