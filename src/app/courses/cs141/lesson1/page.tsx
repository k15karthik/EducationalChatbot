"use client";

import { useState } from "react";

export default function Lesson1Page() {
  // lesson + quiz state
  const [view, setView] = useState<"lesson" | "quiz">("lesson");
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // mixed quiz questions
  const questions = [
    {
      type: "short",
      question: "Explain what an integer is in C++.",
    },
    {
      type: "mc",
      question: "Which of the following correctly declares an integer variable in C++?",
      choices: [
        "int number = 10;",
        "integer num = 10;",
        "num int = 10;",
        "var number = 10;",
      ],
    },
    {
      type: "short",
      question:
        "What is the difference between a signed and an unsigned integer in C++?",
    },
  ];

  // AI grading call
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

      // Ensure feedback always starts with "Nice try, but..." if wrong
      if (!data.correct && !data.feedback.startsWith("Nice try")) {
        data.feedback = "Nice try, but " + data.feedback.charAt(0).toLowerCase() + data.feedback.slice(1);
      }

      setFeedback(data.feedback);
      setIsCorrect(data.correct);
      if (data.correct) {
        setTimeout(() => {
          setCurrentQ((prev) => prev + 1);
          setAnswer("");
          setSelected(null);
          setFeedback("");
          setIsCorrect(null);
        }, 1800);
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
      {/* Top Navigation */}
      <header className="flex justify-between items-center mb-8">
        <a
          href="/courses/cs141"
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back to CS 141
        </a>
        <h1 className="text-2xl font-bold">Lesson 1: Variables and Data Types</h1>
        <div className="w-24" />
      </header>

      {/* Lesson Section */}
      {view === "lesson" && (
        <>
          <p className="text-lg mb-6">
            In this lesson, we’ll explore C++ variables and data types.
            <strong> Integers</strong> represent whole numbers, and come in
            different sizes like <code>short</code>, <code>int</code>,{" "}
            <code>long</code>, and <code>long long</code>.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-2">🧩 Example</h2>
            <pre className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-sm font-mono">
{`int score = 95;      // basic integer
short age = 20;       // smaller integer
long population = 8000000;`}
            </pre>
            <p className="mt-3">
              Integers can be signed or unsigned, determining whether they can
              hold negative values.
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

      {/* Quiz Section */}
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
            </>
          ) : (
            <div className="mt-10 p-8 bg-green-50 rounded-xl border border-green-300">
              <h3 className="text-2xl font-bold text-green-700 mb-3">
                🎉 Excellent work!
              </h3>
              <p>
                You’ve completed all Lesson 1 questions successfully. You can go
                back to the CS141 course dashboard to continue.
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
