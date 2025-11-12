"use client";

import { useState } from "react";

export default function Lesson1Page() {
  const [view, setView] = useState<"lesson" | "quiz">("lesson");
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // One single integrated quiz
  const questions = [
    { type: "short", question: "Explain what an integer is in C++." },
    {
      type: "mc",
      question: "Which of the following correctly declares an integer variable in C++?",
      choices: ["int number = 10;", "integer num = 10;", "num int = 10;", "var number = 10;"],
    },
    { type: "short", question: "What is the difference between a signed and unsigned integer?" },
    {
      type: "code",
      question: "Write a C++ program to check if a number is even or odd.",
    },
    {
      type: "code",
      question: "Implement a program that swaps two integers without using a third variable.",
    },
    {
      type: "mc",
      question: "Which data type is best for representing a student's GPA?",
      choices: ["int", "float", "char", "bool"],
    },
    {
      type: "code",
      question: "Write a program that converts Celsius to Fahrenheit.",
    },
    {
      type: "short",
      question: "What does the sizeof() operator do in C++?",
    },
  ];

  // Grading logic (calls your /api/grade route)
  const gradeWithAI = async (question: string, studentAnswer: string) => {
    setLoading(true);
    setFeedback("");
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, studentAnswer }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
      setIsCorrect(data.correct);

      // Move to next after short delay if correct
      if (data.correct) {
        setTimeout(() => {
          setCurrentQ((prev) => prev + 1);
          setAnswer("");
          setSelected(null);
          setFeedback("");
          setIsCorrect(null);
        }, 2000);
      }
    } catch {
      setFeedback("⚠️ Error: Unable to connect to AI grader.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const q = questions[currentQ];
    if (!answer.trim()) return;
    await gradeWithAI(q.question, answer);
  };

  const handleMC = async (choice: string) => {
    if (loading) return;
    setSelected(choice);
    await gradeWithAI(questions[currentQ].question, choice);
  };

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-white text-black p-10">
      {/* Navbar */}
      <header className="flex justify-between items-center mb-8">
        <a href="/courses/cs141" className="text-blue-600 font-medium hover:underline">
          ← Back to CS141
        </a>
        <h1 className="text-2xl font-bold">Lesson 1: Variables and Data Types</h1>
        <div className="w-24" />
      </header>

      {/* ---------------- LESSON CONTENT ---------------- */}
      {view === "lesson" && (
        <>
          <p className="text-lg leading-relaxed mb-6">
            Welcome to <b>Lesson 1: Variables and Data Types in C++</b>!  
            In this lesson, you’ll learn how C++ stores and handles information using
            <b> primitive data types</b>. Every piece of data—numbers, characters, or
            true/false values—must be stored in a variable with a specific type.
            Understanding these types is one of the most important foundations of
            programming.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-8 space-y-4">
            <h2 className="text-xl font-semibold">🧩 1. What Are Variables?</h2>
            <p>
              A <b>variable</b> is a named container for a value.  
              You declare a variable by specifying its <b>type</b> and <b>name</b>:
            </p>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`int age = 20;
float gpa = 3.7;
char grade = 'A';
bool passed = true;`}</pre>
            <p>
              Here, <code>int</code> stores whole numbers, <code>float</code> stores decimals,
              <code>char</code> stores single characters, and <code>bool</code> represents
              logical true/false values.
            </p>

            <h2 className="text-xl font-semibold pt-4">🔢 2. Integer Types</h2>
            <p>
              Integers represent whole numbers without fractions. C++ offers several
              integer types that differ mainly in size:
            </p>
            <ul className="list-disc ml-6">
              <li><code>short</code> → usually 2 bytes (–32,768 to 32,767)</li>
              <li><code>int</code> → usually 4 bytes (–2 billion to 2 billion)</li>
              <li><code>long</code> / <code>long long</code> → for very large integers</li>
              <li><code>unsigned</code> → only stores non-negative values</li>
            </ul>

            <h2 className="text-xl font-semibold pt-4">🌊 3. Floating-Point Types</h2>
            <p>
              Floating-point types like <code>float</code> and <code>double</code> store
              numbers with decimals. Use them for precision-based calculations.
            </p>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`float pi = 3.14;
double distance = 12345.6789;`}</pre>
            <p>
              Be careful: floating-point math isn’t exact due to binary rounding
              (for example, 0.1 + 0.2 might not exactly equal 0.3).
            </p>

            <h2 className="text-xl font-semibold pt-4">🔠 4. Characters and Strings</h2>
            <p>
              <code>char</code> stores a single letter or symbol using single quotes, while
              a <code>std::string</code> stores text.
            </p>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`char letter = 'C';
std::string word = "Code";`}</pre>
            <p>
              Each character maps to an ASCII number (for example, 'A' = 65).
            </p>

            <h2 className="text-xl font-semibold pt-4">✅ 5. Boolean Type</h2>
            <p>
              <code>bool</code> represents logical truth values. It’s used in conditions and
              decision-making.
            </p>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`bool isRaining = false;
if (isRaining) {
    std::cout << "Bring an umbrella!";
}`}</pre>

            <h2 className="text-xl font-semibold pt-4">⚙️ 6. Type Conversion</h2>
            <p>
              C++ allows implicit and explicit type conversions. Implicit conversions
              happen automatically; explicit conversions use <code>static_cast</code>.
            </p>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`int a = 5;
double b = a;                 // implicit conversion
int c = static_cast<int>(3.9); // explicit conversion → c = 3`}</pre>

            <h2 className="text-xl font-semibold pt-4">📏 7. Sizes and Limits</h2>
            <p>
              Use <code>sizeof()</code> to see how much memory a type uses. This helps you
              understand performance and precision trade-offs.
            </p>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`std::cout << "Size of int: " << sizeof(int) << " bytes";`}</pre>

            <h2 className="text-xl font-semibold pt-4">🚀 8. Why It Matters</h2>
            <p>
              Choosing the right data type affects how your program performs and behaves.
              Mastering this concept helps you avoid overflow errors, rounding issues, and
              wasted memory.
            </p>
          </div>

          <button
            onClick={() => setView("quiz")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:brightness-110"
          >
            Go to Questions →
          </button>
        </>
      )}

      {/* ---------------- QUIZ SECTION ---------------- */}
      {view === "quiz" && (
        <>
          <h2 className="text-2xl font-bold mb-6">
            Lesson 1 Quiz — Question {currentQ + 1} of {questions.length}
          </h2>

          {currentQ < questions.length ? (
            <>
              {q.type === "short" && (
                <div className="border rounded-xl p-6 bg-gray-50 mb-8">
                  <h3 className="text-lg font-semibold mb-2">📝 {q.question}</h3>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:brightness-110"
                  >
                    {loading ? "Grading..." : "Submit"}
                  </button>
                </div>
              )}

              {q.type === "mc" && (
                <div className="border rounded-xl p-6 bg-gray-50 mb-8">
                  <h3 className="text-lg font-semibold mb-4">🔘 {q.question}</h3>
                  <div className="space-y-3">
                    {q.choices!.map((choice, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleMC(choice)}
                        disabled={loading}
                        className={`w-full text-left border rounded-lg p-3 hover:bg-gray-100 ${
                          selected === choice ? "bg-blue-50 border-blue-400" : ""
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {q.type === "code" && (
                <div className="border rounded-xl p-6 bg-gray-50 mb-8">
                  <h3 className="text-lg font-semibold mb-2">💻 {q.question}</h3>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Write your pseudocode or describe your logic..."
                    className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 h-32"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:brightness-110"
                  >
                    {loading ? "Grading..." : "Submit"}
                  </button>
                </div>
              )}

              {feedback && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    isCorrect ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <p className="font-medium">{feedback}</p>
                </div>
              )}
            </>
          ) : (
            <div className="mt-10 p-8 bg-green-50 rounded-xl border border-green-300">
              <h3 className="text-2xl font-bold text-green-700 mb-3">🎉 Excellent Work!</h3>
              <p>
                You’ve completed all questions for Lesson 1. You’re ready to move on to the
                next topic in CS141!
              </p>
              <a
                href="/courses/cs141"
                className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:brightness-110"
              >
                ← Back to CS141
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
