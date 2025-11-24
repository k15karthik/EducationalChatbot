"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import CodeQuestion to avoid SSR issues with Monaco Editor
const CodeQuestion = dynamic(() => import("@/app/components/CodeQuestion"), {
  ssr: false,
});

// Types
interface Question {
  id: number;
  type: "multiple-choice" | "code" | "true-false" | "fill-blank";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  points: number;
  testCases?: { input: string; expected: string }[];
  starter?: string;
}

interface ExamConfig {
  courseId: string;
  examTitle: string;
  duration: number;
  totalPoints: number;
  passingScore: number;
  questions: Question[];
  allowReview: boolean;
  randomizeQuestions: boolean;
}

export default function ExamModePage() {
  const router = useRouter();
  const [examStarted, setExamStarted] = useState(false);
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [codeQuestionPassed, setCodeQuestionPassed] = useState<Record<number, boolean>>({});
  const [gradingResults, setGradingResults] = useState<Record<number, { correct: boolean; feedback: string }>>({});
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load exam configuration
  useEffect(() => {
    const config: ExamConfig = {
      courseId: "cs141",
      examTitle: "CS 141 Practice Exam",
      duration: 60,
      totalPoints: 100,
      passingScore: 70,
      allowReview: true,
      randomizeQuestions: false,
      questions: [
        {
          id: 1,
          type: "multiple-choice",
          question: "What is the correct way to declare an integer variable in C++?",
          options: [
            "var x = 5;",
            "int x = 5;",
            "integer x = 5;",
            "x = 5;",
          ],
          correctAnswer: 1,
          points: 10,
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "Which data type is best for storing a GPA value?",
          options: ["int", "float", "char", "bool"],
          correctAnswer: 1,
          points: 10,
        },
        {
          id: 3,
          type: "true-false",
          question: "C++ is a statically typed language.",
          options: ["True", "False"],
          correctAnswer: 0,
          points: 10,
        },
        {
          id: 4,
          type: "code",
          question: "Write a function that prints 'Even' if a number is even, otherwise 'Odd'.",
          correctAnswer: "",
          points: 20,
          testCases: [
            { input: "4\n", expected: "Even" },
            { input: "7\n", expected: "Odd" },
            { input: "0\n", expected: "Even" },
          ],
          starter: `#include <iostream>
using namespace std;

// TODO: Complete this function
void isEvenOrOdd(int num) {
    // Write your code here
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    isEvenOrOdd(n);
    return 0;
}`,
        },
        {
          id: 5,
          type: "multiple-choice",
          question: "What does the 'sizeof' operator return?",
          options: [
            "The value of a variable",
            "The memory size in bytes",
            "The data type name",
            "The address of a variable",
          ],
          correctAnswer: 1,
          points: 10,
        },
        {
          id: 6,
          type: "code",
          question: "Swap two integers without using a third variable.",
          correctAnswer: "",
          points: 20,
          testCases: [
            { input: "5 9\n", expected: "9 5" },
            { input: "0 1\n", expected: "1 0" },
          ],
          starter: `#include <iostream>
using namespace std;

// TODO: Complete this function
void swapNumbers(long long &a, long long &b) {
    // Write your code here
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
          id: 7,
          type: "true-false",
          question: "The 'unsigned' keyword can only be used with integer types.",
          options: ["True", "False"],
          correctAnswer: 0,
          points: 10,
        },
        {
          id: 8,
          type: "fill-blank",
          question: "A data type that can store decimal numbers with more precision than 'float' is called ________.",
          correctAnswer: "double",
          points: 10,
        },
      ],
    };
    setExamConfig(config);
  }, []);

  // Timer effect
  useEffect(() => {
    if (examStarted && timeRemaining > 0 && !examSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeRemaining, examSubmitted]);

  const startExam = () => {
    if (examConfig) {
      setExamStarted(true);
      setTimeRemaining(examConfig.duration * 60);
    }
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleCodeQuestionPass = (questionId: number) => {
    setCodeQuestionPassed((prev) => ({
      ...prev,
      [questionId]: true,
    }));
    setAnswers((prev) => ({
      ...prev,
      [questionId]: "passed",
    }));
  };

  const toggleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const confirmSubmit = () => {
    const unansweredCount =
      examConfig!.questions.length - Object.keys(answers).length;
    
    const message = unansweredCount > 0
      ? `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit the exam?`
      : "Are you sure you want to submit the exam?";
    
    if (confirm(message)) {
      handleSubmitExam(false);
    }
  };

  const handleSubmitExam = async (autoSubmit = false) => {
    setIsSubmitting(true);
    
    let totalScore = 0;
    const results: Record<number, { correct: boolean; feedback: string }> = {};

    // Grade all questions
    for (const question of examConfig!.questions) {
      const userAnswer = answers[question.id];

      if (question.type === "multiple-choice" || question.type === "true-false") {
        const isCorrect = userAnswer === question.correctAnswer;
        results[question.id] = {
          correct: isCorrect,
          feedback: isCorrect ? "Correct!" : "Incorrect",
        };
        if (isCorrect) {
          totalScore += question.points;
        }
      }

      if (question.type === "code") {
        const isPassed = codeQuestionPassed[question.id];
        results[question.id] = {
          correct: isPassed || false,
          feedback: isPassed ? "All test cases passed!" : "Not all test cases passed",
        };
        if (isPassed) {
          totalScore += question.points;
        }
      }

      if (question.type === "fill-blank") {
        // Use AI to grade fill-in-the-blank
        if (userAnswer && userAnswer.trim() !== "") {
          try {
            const res = await fetch("/api/grade", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: question.question,
                expectedAnswer: question.correctAnswer,
                studentAnswer: userAnswer,
              }),
            });
            const data = await res.json();
            results[question.id] = {
              correct: data.correct,
              feedback: data.feedback,
            };
            if (data.correct) {
              totalScore += question.points;
            }
          } catch (error) {
            results[question.id] = {
              correct: false,
              feedback: "Error grading response",
            };
          }
        } else {
          results[question.id] = {
            correct: false,
            feedback: "No answer provided",
          };
        }
      }
    }

    setGradingResults(results);
    setScore(totalScore);
    setExamSubmitted(true);
    setIsSubmitting(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!examConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-xl">Loading exam...</div>
      </div>
    );
  }

  // Pre-exam screen
  if (!examStarted) {
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
            <a
              href="/profile"
              className="block font-medium text-black hover:text-blue-600"
            >
              Profile
            </a>
          </div>
        </aside>

        <main className="flex-1 px-12 py-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">{examConfig.examTitle}</h1>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Exam Instructions</h2>
              <ul className="space-y-2">
                <li>• Duration: {examConfig.duration} minutes</li>
                <li>• Total Points: {examConfig.totalPoints}</li>
                <li>• Passing Score: {examConfig.passingScore}%</li>
                <li>• Number of Questions: {examConfig.questions.length}</li>
                <li>• You can flag questions for review</li>
                <li>• The exam will auto-submit when time expires</li>
                <li>• Code questions must pass all test cases to receive full credit</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-2">⚠️ Important Notes:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Do not refresh the page during the exam</li>
                <li>• Do not navigate away from this page</li>
                <li>• Ensure you submit before time runs out</li>
                <li>• For code questions, run and pass all test cases</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startExam}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Start Exam
              </button>
              <button
                onClick={() => router.push("/courses/cs141")}
                className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Exam results and review screen
  if (examSubmitted && score !== null) {
    const percentage = (score / examConfig.totalPoints) * 100;
    const passed = percentage >= examConfig.passingScore;

    if (isReviewing) {
      // Review mode - show all questions with answers
      const currentQuestion = examConfig.questions[currentQuestionIndex];
      const userAnswer = answers[currentQuestion.id];
      const result = gradingResults[currentQuestion.id];

      return (
        <div className="flex min-h-screen bg-white text-black">
          <aside className="w-64 border-r border-gray-200 p-6 flex flex-col">
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Review Mode</h2>
              <div className="text-sm text-gray-600">
                Score: {score}/{examConfig.totalPoints}
              </div>
            </div>

            <div className="mb-4 flex-1 overflow-y-auto">
              <h2 className="font-semibold mb-2">Questions</h2>
              <div className="grid grid-cols-4 gap-2">
                {examConfig.questions.map((q, idx) => {
                  const qResult = gradingResults[q.id];
                  const isCorrect = qResult?.correct;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`aspect-square rounded flex items-center justify-center text-sm font-medium
                        ${idx === currentQuestionIndex ? "ring-2 ring-blue-600" : ""}
                        ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        hover:opacity-80
                      `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setIsReviewing(false)}
                className="w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 mb-2"
              >
                Back to Results
              </button>
              <button
                onClick={() => router.push("/courses/cs141")}
                className="w-full border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50"
              >
                Exit to Course
              </button>
            </div>
          </aside>

          <main className="flex-1 px-12 py-10 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              Question {currentQuestionIndex + 1} of {examConfig.questions.length}
            </h2>

            <div className="bg-gray-50 border rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-lg font-medium">{currentQuestion.question}</p>
                <span className="text-sm text-gray-600 ml-4 whitespace-nowrap">
                  {currentQuestion.points} points
                </span>
              </div>

              {/* Show the question and answer */}
              {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isUserAnswer = userAnswer === idx;
                    const isCorrectAnswer = currentQuestion.correctAnswer === idx;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center p-4 border rounded-lg ${
                          isCorrectAnswer
                            ? "border-green-500 bg-green-50"
                            : isUserAnswer
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      >
                        <div className="mr-3">
                          {isCorrectAnswer && "✅"}
                          {isUserAnswer && !isCorrectAnswer && "❌"}
                        </div>
                        <span>{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "true-false" && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isUserAnswer = userAnswer === idx;
                    const isCorrectAnswer = currentQuestion.correctAnswer === idx;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center p-4 border rounded-lg ${
                          isCorrectAnswer
                            ? "border-green-500 bg-green-50"
                            : isUserAnswer
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      >
                        <div className="mr-3">
                          {isCorrectAnswer && "✅"}
                          {isUserAnswer && !isCorrectAnswer && "❌"}
                        </div>
                        <span>{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "code" && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    result?.correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    <p className="font-semibold">
                      {result?.correct ? "✅ Correct - All test cases passed" : "❌ Incorrect - Not all test cases passed"}
                    </p>
                  </div>
                  {currentQuestion.testCases && (
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-semibold mb-2">Test Cases:</h4>
                      {currentQuestion.testCases.map((tc, idx) => (
                        <div key={idx} className="text-sm mb-2">
                          <div><strong>Input:</strong> {tc.input}</div>
                          <div><strong>Expected:</strong> {tc.expected}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentQuestion.type === "fill-blank" && (
                <div className="space-y-4">
                  <div className="p-4 bg-white border rounded-lg">
                    <p><strong>Your Answer:</strong> {userAnswer || "(No answer provided)"}</p>
                    <p><strong>Expected:</strong> {currentQuestion.correctAnswer}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    result?.correct ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    <p className="font-semibold">{result?.correct ? "✅" : "❌"} {result?.feedback}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(examConfig.questions.length - 1, prev + 1)
                  )
                }
                disabled={currentQuestionIndex === examConfig.questions.length - 1}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </main>
        </div>
      );
    }

    // Results summary screen
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
            <a
              href="/profile"
              className="block font-medium text-black hover:text-blue-600"
            >
              Profile
            </a>
          </div>
        </aside>

        <main className="flex-1 px-12 py-10">
          <div className="max-w-3xl mx-auto">
            <div className={`border-4 rounded-lg p-8 text-center ${
              passed ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
            }`}>
              <h1 className="text-3xl font-bold mb-4">
                {passed ? "🎉 Congratulations!" : "📚 Keep Practicing"}
              </h1>
              <p className="text-xl mb-6">
                You {passed ? "passed" : "did not pass"} the exam
              </p>
              
              <div className="bg-white rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold mb-2">
                  {score} / {examConfig.totalPoints}
                </div>
                <div className="text-2xl text-gray-600">
                  {percentage.toFixed(1)}%
                </div>
              </div>

              <div className="space-y-4">
                {examConfig.allowReview && (
                  <button
                    onClick={() => {
                      setIsReviewing(true);
                      setCurrentQuestionIndex(0);
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Review Answers
                  </button>
                )}
                <button
                  onClick={() => router.push("/courses/cs141")}
                  className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back to Course
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active exam screen
  const currentQuestion = examConfig.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / examConfig.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === examConfig.questions.length - 1;

  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Sidebar with question navigator */}
      <aside className="w-64 border-r border-gray-200 p-6 flex flex-col">
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Time Remaining</h2>
          <div className={`text-2xl font-bold ${
            timeRemaining < 300 ? "text-red-600" : "text-gray-900"
          }`}>
            {formatTime(timeRemaining)}
          </div>
        </div>

        <div className="mb-4 flex-1 overflow-y-auto">
          <h2 className="font-semibold mb-2">Questions</h2>
          <div className="grid grid-cols-4 gap-2">
            {examConfig.questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isPassed = codeQuestionPassed[q.id];
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`aspect-square rounded flex items-center justify-center text-sm font-medium relative
                    ${idx === currentQuestionIndex ? "bg-blue-600 text-white" : ""}
                    ${idx !== currentQuestionIndex && (isAnswered || isPassed) ? "bg-green-100 text-green-800" : ""}
                    ${idx !== currentQuestionIndex && !isAnswered && !isPassed ? "bg-gray-100 text-gray-600" : ""}
                    hover:opacity-80
                  `}
                >
                  {idx + 1}
                  {flaggedQuestions.has(q.id) && (
                    <span className="absolute -top-1 -right-1 text-yellow-500">
                      🚩
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">
            <div>Answered: {Object.keys(answers).length} / {examConfig.questions.length}</div>
            <div>Flagged: {flaggedQuestions.size}</div>
          </div>
          <button
            onClick={confirmSubmit}
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </aside>

      {/* Main exam area */}
      <main className="flex-1 px-12 py-10 overflow-y-auto">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Question {currentQuestionIndex + 1} of {examConfig.questions.length}
            </h2>
            <button
              onClick={() => toggleFlagQuestion(currentQuestion.id)}
              className={`px-4 py-2 rounded-lg border ${
                flaggedQuestions.has(currentQuestion.id)
                  ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {flaggedQuestions.has(currentQuestion.id) ? "🚩 Flagged" : "Flag for Review"}
            </button>
          </div>

          <div className="bg-gray-50 border rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-lg font-medium">{currentQuestion.question}</p>
              <span className="text-sm text-gray-600 ml-4 whitespace-nowrap">
                {currentQuestion.points} points
              </span>
            </div>

            {/* Multiple choice */}
            {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 ${
                      answers[currentQuestion.id] === idx ? "border-blue-500 bg-blue-50" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={idx}
                      checked={answers[currentQuestion.id] === idx}
                      onChange={() => handleAnswerChange(currentQuestion.id, idx)}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* True/False */}
            {currentQuestion.type === "true-false" && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 ${
                      answers[currentQuestion.id] === idx ? "border-blue-500 bg-blue-50" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={idx}
                      checked={answers[currentQuestion.id] === idx}
                      onChange={() => handleAnswerChange(currentQuestion.id, idx)}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Fill in the blank */}
            {currentQuestion.type === "fill-blank" && (
              <div>
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full p-4 border rounded-lg"
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            {/* Code question with Monaco Editor */}
            {currentQuestion.type === "code" && (
              <div className="mt-4">
                <CodeQuestion
                  key={currentQuestion.id}
                  question={currentQuestion.question}
                  testCases={currentQuestion.testCases || []}
                  starter={currentQuestion.starter}
                  onPass={() => handleCodeQuestionPass(currentQuestion.id)}
                />
                {codeQuestionPassed[currentQuestion.id] && (
                  <div className="mt-3 p-4 rounded-lg bg-green-100 text-green-800">
                    ✅ This question is complete! You can move to the next question.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            {isLastQuestion ? (
              <button
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Exam"}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}