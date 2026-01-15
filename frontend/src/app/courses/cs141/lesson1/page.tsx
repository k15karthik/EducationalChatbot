// app/courses/cs141/lesson1/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Sparkles, User, ArrowLeft, BookOpen, CheckCircle } from "lucide-react";
import { LessonsAPI } from "@/lib/api/progress";

// Monaco Editor
const CodeQuestion = dynamic(() => import("@/app/components/CodeQuestion"), {
  ssr: false,
});

type QuestionType = 
  | { type: "blank"; question: string; answer: string }
  | { type: "mc"; question: string; choices: string[]; correct: string }
  | {
      type: "code";
      question: string;
      testCases: { input: string; expected: string }[];
      starter?: string;
    };

export default function Lesson1Page() {
  const [view, setView] = useState<"lesson" | "quiz">("lesson");
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blankAnswer, setBlankAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showNext, setShowNext] = useState(false);

  // Score tracking state
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [submittingProgress, setSubmittingProgress] = useState(false);
  const [progressSubmitted, setProgressSubmitted] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const hasSubmitted = useRef(false);

  // ------------ QUESTIONS -------------
  const questions: QuestionType[] = [
    {
      type: "blank",
      question: "A(n) ________ is a whole-number data type in C++.",
      answer: "integer|int",
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
      // Check if expected answer contains multiple options separated by |
      const acceptableAnswers = expected.toLowerCase().split('|');
      const studentAnswer = student.toLowerCase().trim();
      
      // Check if student answer matches any acceptable answer
      const isDirectMatch = acceptableAnswers.some(ans => ans.trim() === studentAnswer);
      
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
      
      // Override AI decision if there's a direct match
      if (isDirectMatch) {
        setFeedback("✅ Correct!");
        setIsCorrect(true);
        setShowNext(true);
        setCorrectAnswers(prev => prev + 1);
      } else {
        setFeedback(data.feedback);
        setIsCorrect(data.correct);
        if (data.correct) {
          setShowNext(true);
          setCorrectAnswers(prev => prev + 1);
        }
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

  // Submit progress when quiz is completed
  const submitProgress = async () => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    const token = localStorage.getItem("token");
    if (!token) {
      setProgressError("Please log in to save your progress");
      return;
    }

    setSubmittingProgress(true);
    setProgressError(null);

    try {
      const scorePercentage = Math.round((correctAnswers / questions.length) * 100);
      await LessonsAPI.completeLesson({
        course_id: "cs141",
        lesson_id: "lesson1",
        completed: true,
        quiz_score: scorePercentage,
      });
      setProgressSubmitted(true);
    } catch (error) {
      console.error("Failed to save progress:", error);
      setProgressError("Failed to save progress. Please try again.");
      hasSubmitted.current = false;
    } finally {
      setSubmittingProgress(false);
    }
  };

  // Auto-submit progress when quiz completes
  useEffect(() => {
    if (currentQ >= questions.length && !progressSubmitted) {
      submitProgress();
    }
  }, [currentQ, questions.length, progressSubmitted]);

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F1F1F]">
      <TopBar />
      
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Link 
            href="/courses/cs141"
            className="inline-flex items-center space-x-2 text-[#3B6B8C] hover:text-[#2F5570] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to CS 141</span>
          </Link>

          {/* Lesson Header */}
          <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
            <div className="flex items-center space-x-3 mb-2">
              <BookOpen className="w-6 h-6 text-[#3B6B8C]" />
              <h1 className="text-2xl font-bold">Lesson 1: Variables and Data Types</h1>
            </div>
            <p className="text-[#5C5C5C]">Learn about primitive data types in C++</p>
          </section>

          {/* ===================== LESSON SECTION ===================== */}
          {view === "lesson" ? (
            <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6 space-y-6">
              <p className="text-base leading-relaxed">
                Welcome to <strong>Lesson 1: Variables and Data Types in C++</strong>! In this
                lesson, you'll learn how C++ stores and handles information using{" "}
                <strong>primitive data types</strong>. Every piece of data—numbers, characters,
                or true/false values—must be stored in a variable with a specific
                type. Understanding these types is one of the most important
                foundations of programming.
              </p>

              <div className="space-y-6">
                <LessonSection title="🧩 1. What Are Variables?">
                  <p className="mb-3">
                    A <strong>variable</strong> is a named container for a value. You declare a
                    variable by specifying its <strong>type</strong> and <strong>name</strong>:
                  </p>
                  <CodeBlock>{`int age = 20;
float gpa = 3.7;
char grade = 'A';
bool passed = true;`}</CodeBlock>
                  <p className="mt-3">
                    <code className="px-2 py-1 bg-[#F5F5F5] rounded text-sm">int</code> → whole numbers,{" "}
                    <code className="px-2 py-1 bg-[#F5F5F5] rounded text-sm">float</code>/
                    <code className="px-2 py-1 bg-[#F5F5F5] rounded text-sm">double</code> → decimals,{" "}
                    <code className="px-2 py-1 bg-[#F5F5F5] rounded text-sm">char</code> → single character,{" "}
                    <code className="px-2 py-1 bg-[#F5F5F5] rounded text-sm">bool</code> → true/false.
                  </p>
                </LessonSection>

                <LessonSection title="🔢 2. Integer Types">
                  <ul className="list-disc ml-6 space-y-1">
                    <li><code className="px-2 py-1 bg-[#F5F5F5] rounded text-sm">short</code> (≈2 bytes)</li>
                    <li><code className="px-2 py-1 bg-[#F5F5F5] rounded text-sm">int</code> (≈4 bytes)</li>
                    <li><code className="px-2 py-1 bg-[#F5F5F5] rounded text-sm">long</code>, <code className="px-2 py-1 bg-[#F5F5F5] rounded text-sm">long long</code> (larger ranges)</li>
                    <li><code className="px-2 py-1 bg-[#F5F5F5] rounded text-sm">unsigned</code> → only non-negative values</li>
                  </ul>
                </LessonSection>

                <LessonSection title="🌊 3. Floating-Point">
                  <CodeBlock>{`float pi = 3.14;
double distance = 12345.6789;`}</CodeBlock>
                  <p className="mt-3">
                    Floating-point math can experience rounding error due to binary
                    representation.
                  </p>
                </LessonSection>

                <LessonSection title="🔤 4. Characters & Strings">
                  <CodeBlock>{`char letter = 'C';
string word = "Code";`}</CodeBlock>
                </LessonSection>

                <LessonSection title="✅ 5. Boolean">
                  <CodeBlock>{`bool isRaining = false;
if (isRaining) { cout << "Bring an umbrella!"; }`}</CodeBlock>
                </LessonSection>

                <LessonSection title="⚙️ 6. Type Conversion">
                  <CodeBlock>{`int a = 5;
double b = a;                 // implicit conversion
int c = static_cast<int>(3.9); // explicit → c = 3`}</CodeBlock>
                </LessonSection>

                <LessonSection title="📏 7. Sizes">
                  <CodeBlock>{`cout << sizeof(int);`}</CodeBlock>
                </LessonSection>

                <LessonSection title="🚀 8. Why It Matters">
                  <p>
                    Picking the right type affects memory, precision, and correctness.
                    It prevents overflow, rounding issues, and bugs.
                  </p>
                </LessonSection>
              </div>

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setView("quiz");
                }}
                className="flex items-center space-x-2 bg-[#3B6B8C] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2F5570] transition-colors"
              >
                <span>Start Quiz</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </section>
          ) : (
            <div className="space-y-6">
              {/* ===================== QUIZ SECTION ===================== */}
              {currentQ < questions.length && (
                <>
                  {/* Progress Header */}
                  <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        Question {currentQ + 1} of {questions.length}
                      </h2>
                      <div className="text-sm text-[#5C5C5C]">
                        Progress: {Math.round(((currentQ) / questions.length) * 100)}%
                      </div>
                    </div>
                  </section>

                  {/* FILL-IN-BLANK */}
                  {q.type === "blank" && (
                    <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
                      <h3 className="text-lg font-semibold mb-4">📝 {q.question}</h3>

                      <input
                        value={blankAnswer}
                        onChange={(e) => setBlankAnswer(e.target.value)}
                        placeholder="Type missing word..."
                        className="w-full border border-[#D4D4D4] rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40 bg-white"
                      />

                      <button
                        onClick={() =>
                          gradeWithAI(q.answer.toLowerCase(), blankAnswer.toLowerCase())
                        }
                        disabled={loading}
                        className="bg-[#3B6B8C] text-white px-6 py-2 rounded-lg hover:bg-[#2F5570] transition-colors disabled:opacity-50"
                      >
                        {loading ? "Checking..." : "Submit"}
                      </button>

                      {feedback && (
                        <div
                          className={`mt-4 p-4 rounded-lg ${
                            isCorrect
                              ? "bg-green-50 text-green-800 border border-green-200"
                              : "bg-yellow-50 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          <p className="font-medium">{feedback}</p>
                        </div>
                      )}

                      {showNext && (
                        <button
                          onClick={handleNext}
                          className="mt-4 flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <span>Next Question</span>
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                      )}
                    </section>
                  )}

                  {/* MULTIPLE CHOICE */}
                  {q.type === "mc" && (
                    <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
                      <h3 className="text-lg font-semibold mb-4">📘 {q.question}</h3>

                      <div className="space-y-2 mb-4">
                        {q.choices.map((choice: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelected(choice);
                              gradeWithAI(q.correct.toLowerCase(), choice.toLowerCase());
                            }}
                            disabled={loading}
                            className={`w-full text-left border rounded-lg p-4 transition-colors ${
                              selected === choice
                                ? "bg-[#3B6B8C]/10 border-[#3B6B8C]"
                                : "bg-[#F5F5F5] border-[#E8E8E8] hover:border-[#3B6B8C]"
                            }`}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>

                      {feedback && (
                        <div
                          className={`mt-4 p-4 rounded-lg ${
                            isCorrect
                              ? "bg-green-50 text-green-800 border border-green-200"
                              : "bg-yellow-50 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          <p className="font-medium">{feedback}</p>
                        </div>
                      )}

                      {showNext && (
                        <button
                          onClick={handleNext}
                          className="mt-4 flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <span>Next Question</span>
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                      )}
                    </section>
                  )}

                  {/* CODE QUESTION */}
                  {q.type === "code" && (
                    <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
                      <CodeQuestion
                        key={currentQ}
                        question={q.question}
                        testCases={q.testCases}
                        starter={q.starter}
                        onPass={() => {
                          setShowNext(true);
                          setCorrectAnswers(prev => prev + 1);
                        }}
                      />
                      
                      {showNext && (
                        <button
                          onClick={handleNext}
                          className="mt-4 flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <span>Next Question</span>
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                      )}
                    </section>
                  )}
                </>
              )}

              {/* END OF QUIZ */}
              {currentQ >= questions.length && (
                <section className="rounded-lg bg-green-50 border border-green-200 p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-700 mb-3">
                    Excellent Work!
                  </h3>
                  <p className="text-green-800 mb-2">
                    You've completed all questions for Lesson 1!
                  </p>

                  {/* Score display */}
                  <p className="text-lg font-semibold text-green-700 mb-4">
                    Score: {correctAnswers} / {questions.length} ({Math.round((correctAnswers / questions.length) * 100)}%)
                  </p>

                  {/* Progress saving status */}
                  {submittingProgress && (
                    <p className="text-[#5C5C5C] mb-4">Saving your progress...</p>
                  )}
                  {progressSubmitted && (
                    <p className="text-green-600 mb-4">Progress saved!</p>
                  )}
                  {progressError && (
                    <p className="text-red-600 mb-4">{progressError}</p>
                  )}

                  <Link
                    href="/courses/cs141"
                    className="inline-flex items-center space-x-2 bg-[#3B6B8C] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2F5570] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to CS 141</span>
                  </Link>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <header className="bg-white border-b border-[#E8E8E8]">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#3B6B8C]" />
            <span className="font-semibold text-lg">EduChatbot</span>
          </Link>
          <span className="text-sm text-[#999999]">|</span>
          <span className="text-sm font-medium">Lesson 1</span>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/profile"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#1F1F1F] transition-colors border border-[#E8E8E8]"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function LessonSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-[#3B6B8C] pl-4">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="text-[#1F1F1F] space-y-2">{children}</div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E8E8E8] text-sm font-mono overflow-x-auto">
      {children}
    </pre>
  );
}