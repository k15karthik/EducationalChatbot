"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Monaco Editor
const CodeQuestion = dynamic(() => import("@/app/components/CodeQuestion"), {
  ssr: false,
});

export default function Lesson1Page() {
  const [view, setView] = useState<"lesson" | "quiz">("lesson");
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blankAnswer, setBlankAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showNext, setShowNext] = useState(false);

  // ------------ QUESTIONS -------------
  const questions: Array<
    | { type: "blank"; question: string; answer: string }
    | { type: "mc"; question: string; choices: string[]; correct: string }
    | {
        type: "code";
        question: string;
        testCases: { input: string; expected: string }[];
        starter?: string;
      }
  > = [
    {
      type: "blank",
      question: "A(n) ________ is a whole-number data type in C++.",
      answer: "integer",
    },
    {
      type: "mc",
      question: "Which correctly declares an integer variable in C++?",
      choices: [
        "int number = 10;",
        "integer num = 10;",
        "num int = 10;",
        "var number = 10;",
      ],
      correct: "int number = 10;",
    },
    {
      type: "code",
      question:
        'Write a function that prints "Even" if a number is even, otherwise "Odd".',
      testCases: [
        { input: "4\n", expected: "Even" },
        { input: "7\n", expected: "Odd" },
        { input: "0\n", expected: "Even" },
      ],
      starter: `#include <iostream>
using namespace std;

// TODO: Complete this function
void isEvenOrOdd(int num) {
    // Write comment here
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    isEvenOrOdd(n);
    return 0;
}`,
    },
    {
      type: "code",
      question: "Swap two integers without using a third variable.",
      testCases: [
        { input: "5 9\n", expected: "9 5" },
        { input: "0 1\n", expected: "1 0" },
      ],
      starter: `#include <iostream>
using namespace std;

// TODO: Complete this function
void swapNumbers(long long &a, long long &b) {
    // Write comment here
}

int main() {
    long long a, b;
    if (!(cin >> a >> b)) return 0;
    swapNumbers(a, b);
    cout << a << " " << b;
    return 0;
}`,
    },
    {
      type: "mc",
      question: "Which data type is best for GPA?",
      choices: ["int", "float", "char", "bool"],
      correct: "float",
    },
    {
      type: "code",
      question: "Convert Celsius to Fahrenheit. Formula: F = (C × 9/5) + 32",
      testCases: [
        { input: "0\n", expected: "32" },
        { input: "100\n", expected: "212" },
      ],
      starter: `#include <iostream>
using namespace std;

// TODO: Complete this function
// Formula: F = (C × 9/5) + 32
void celsiusToFahrenheit(double celsius) {
    // Calculate fahrenheit and print it
    // Example: double fahrenheit = ...
    //          cout << fahrenheit;
}

int main() {
    double c;
    if (!(cin >> c)) return 0;
    celsiusToFahrenheit(c);
    return 0;
}`,
    },
    {
      type: "blank",
      question: "The operator that gives the memory size of a type is ________.",
      answer: "sizeof",
    },
  ];

  // ----------- AI GRADER FOR BLANK + MC --------------
  const gradeWithAI = async (expected: string, student: string) => {
    setLoading(true);
    setFeedback("");
    setIsCorrect(null);

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "grading fill blank",
          expectedAnswer: expected,
          studentAnswer: student,
        }),
      });

      const data = await res.json();
      setFeedback(data.feedback);
      setIsCorrect(data.correct);

      if (data.correct) {
        setShowNext(true);
      }
    } catch {
      setFeedback("⚠️ Could not connect to grader.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentQ((prev) => prev + 1);
    setBlankAnswer("");
    setSelected(null);
    setFeedback("");
    setIsCorrect(null);
    setShowNext(false);
  };

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-white text-black p-10">
      {/* NAVBAR */}
      <header className="flex justify-between items-center mb-8">
        <a href="/courses/cs141" className="text-blue-600 hover:underline">
          ← Back to CS141
        </a>
        <h1 className="text-2xl font-bold">Lesson 1: Variables and Data Types</h1>
        <div className="w-24" />
      </header>

      {/* ===================== LESSON SECTION RESTORED ===================== */}
      {view === "lesson" ? (
        <>
          {/* LESSON SECTION */}
          <p className="text-lg leading-relaxed mb-6">
            Welcome to <b>Lesson 1: Variables and Data Types in C++</b>! In this
            lesson, you’ll learn how C++ stores and handles information using{" "}
            <b>primitive data types</b>. Every piece of data—numbers, characters,
            or true/false values—must be stored in a variable with a specific
            type. Understanding these types is one of the most important
            foundations of programming.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-8 space-y-4">
            <h2 className="text-xl font-semibold">🧩 1. What Are Variables?</h2>
            <p>
              A <b>variable</b> is a named container for a value. You declare a
              variable by specifying its <b>type</b> and <b>name</b>:
            </p>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`int age = 20;
float gpa = 3.7;
char grade = 'A';
bool passed = true;`}</pre>
            <p>
              <code>int</code> → whole numbers, <code>float</code>/<code>double</code> →
              decimals, <code>char</code> → single character, <code>bool</code> → true/false.
            </p>

            <h2 className="text-xl font-semibold pt-4">🔢 2. Integer Types</h2>
            <ul className="list-disc ml-6">
              <li><code>short</code> (≈2 bytes)</li>
              <li><code>int</code> (≈4 bytes)</li>
              <li>
                <code>long</code>, <code>long long</code> (larger ranges)
              </li>
              <li>
                <code>unsigned</code> → only non-negative values
              </li>
            </ul>

            <h2 className="text-xl font-semibold pt-4">🌊 3. Floating-Point</h2>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`float pi = 3.14;
double distance = 12345.6789;`}</pre>
            <p>
              Floating-point math can experience rounding error due to binary
              representation.
            </p>

            <h2 className="text-xl font-semibold pt-4">🔠 4. Characters & Strings</h2>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`char letter = 'C';
string word = "Code";`}</pre>

            <h2 className="text-xl font-semibold pt-4">✅ 5. Boolean</h2>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`bool isRaining = false;
if (isRaining) { cout << "Bring an umbrella!"; }`}</pre>

            <h2 className="text-xl font-semibold pt-4">⚙️ 6. Type Conversion</h2>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`int a = 5;
double b = a;                 // implicit conversion
int c = static_cast<int>(3.9); // explicit → c = 3`}</pre>

            <h2 className="text-xl font-semibold pt-4">📏 7. Sizes</h2>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">{`cout << sizeof(int);`}</pre>

            <h2 className="text-xl font-semibold pt-4">🚀 8. Why It Matters</h2>
            <p>
              Picking the right type affects memory, precision, and correctness.
              It prevents overflow, rounding issues, and bugs.
            </p>
          </div>

          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setView("quiz");
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:brightness-110"
          >
            Go to Questions →
          </button>
        </>
      ) : (
        <div>
          {/* ===================== QUIZ SECTION ===================== */}
          {currentQ < questions.length && (
            <>
              <h2 className="text-2xl font-bold mb-6">
                Lesson 1 Quiz — Question {currentQ + 1} of {questions.length}
              </h2>

              {/* FILL-IN-BLANK */}
              {q.type === "blank" && (
            <div className="border rounded-xl p-6 bg-gray-50 mb-8">
              <h3 className="text-lg font-semibold mb-2">📝 {q.question}</h3>

              <input
                value={blankAnswer}
                onChange={(e) => setBlankAnswer(e.target.value)}
                placeholder="Type missing word..."
                className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={() =>
                  gradeWithAI(q.answer.toLowerCase(), blankAnswer.toLowerCase())
                }
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:brightness-110"
              >
                {loading ? "Checking..." : "Submit"}
              </button>

              {feedback && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    isCorrect
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <p className="font-medium">{feedback}</p>
                </div>
              )}

              {showNext && (
                <button
                  onClick={handleNext}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:brightness-110"
                >
                  Next Question →
                </button>
              )}
            </div>
          )}

          {/* MULTIPLE CHOICE */}
          {q.type === "mc" && (
            <div className="border rounded-xl p-6 bg-gray-50 mb-8">
              <h3 className="text-lg font-semibold mb-4">🔘 {q.question}</h3>

              {q.choices.map((choice: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() =>
                    gradeWithAI(q.correct.toLowerCase(), choice.toLowerCase())
                  }
                  disabled={loading}
                  className={`w-full text-left border rounded-lg p-3 hover:bg-gray-100 ${
                    selected === choice ? "bg-blue-50 border-blue-400" : ""
                  }`}
                >
                  {choice}
                </button>
              ))}

              {feedback && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    isCorrect
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <p className="font-medium">{feedback}</p>
                </div>
              )}

              {showNext && (
                <button
                  onClick={handleNext}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:brightness-110"
                >
                  Next Question →
                </button>
              )}
            </div>
          )}

          {/* CODE QUESTION */}
          {q.type === "code" && (
            <>
              <CodeQuestion
                key={currentQ}
                question={q.question}
                testCases={q.testCases}
                starter={q.starter}
                onPass={() => {
                  setShowNext(true);
                }}
              />
              
              {showNext && (
                <button
                  onClick={handleNext}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:brightness-110"
                >
                  Next Question →
                </button>
              )}
            </>
          )}
            </>
          )}

          {/* END OF QUIZ */}
          {currentQ >= questions.length && (
            <div className="mt-10 p-8 bg-green-50 rounded-xl border border-green-300">
              <h3 className="text-2xl font-bold text-green-700 mb-3">
                🎉 Excellent Work!
              </h3>
              <p>You’ve completed all questions for Lesson 1!</p>

              <a
                href="/courses/cs141"
                className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:brightness-110"
              >
                ← Back to CS141
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}