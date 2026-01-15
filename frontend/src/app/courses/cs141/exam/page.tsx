// app/courses/cs141/exam/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Sparkles, 
  User, 
  ArrowLeft, 
  Clock, 
  Flag, 
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-xl text-[#5C5C5C]">Loading exam...</div>
      </div>
    );
  }

  // Pre-exam screen
  if (!examStarted) {
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

            {/* Exam Header */}
            <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
              <h1 className="text-3xl font-bold mb-2">{examConfig.examTitle}</h1>
              <p className="text-[#5C5C5C]">Test your knowledge of CS 141 concepts</p>
            </section>

            {/* Instructions */}
            <section className="rounded-lg bg-blue-50 border border-blue-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span>Exam Instructions</span>
              </h2>
              <ul className="space-y-2 text-[#1F1F1F]">
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Duration: {examConfig.duration} minutes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Total Points: {examConfig.totalPoints}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Passing Score: {examConfig.passingScore}%</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Number of Questions: {examConfig.questions.length}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>You can flag questions for review</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>The exam will auto-submit when time expires</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Code questions must pass all test cases to receive full credit</span>
                </li>
              </ul>
            </section>

            {/* Important Notes */}
            <section className="rounded-lg bg-yellow-50 border border-yellow-200 p-6">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span>Important Notes</span>
              </h3>
              <ul className="space-y-2 text-sm text-[#1F1F1F]">
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Do not refresh the page during the exam</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Do not navigate away from this page</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Ensure you submit before time runs out</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>For code questions, run and pass all test cases</span>
                </li>
              </ul>
            </section>

            {/* Action Buttons */}
            <section className="flex gap-4">
              <button
                onClick={startExam}
                className="flex-1 bg-[#3B6B8C] text-white py-3 rounded-lg font-semibold hover:bg-[#2F5570] transition-colors"
              >
                Start Exam
              </button>
              <button
                onClick={() => router.push("/courses/cs141")}
                className="flex-1 border border-[#E8E8E8] py-3 rounded-lg font-semibold hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
            </section>
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
        <div className="min-h-screen bg-[#FAFAFA] text-[#1F1F1F] flex">
          {/* Sidebar */}
          <ReviewSidebar 
            questions={examConfig.questions}
            currentIndex={currentQuestionIndex}
            setCurrentIndex={setCurrentQuestionIndex}
            gradingResults={gradingResults}
            score={score}
            totalPoints={examConfig.totalPoints}
            onBackToResults={() => setIsReviewing(false)}
            onExit={() => router.push("/courses/cs141")}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <TopBar />
            
            <main className="flex-1 px-6 py-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold">
                  Question {currentQuestionIndex + 1} of {examConfig.questions.length}
                </h2>

                <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-lg font-medium">{currentQuestion.question}</p>
                    <span className="text-sm text-[#5C5C5C] ml-4 whitespace-nowrap">
                      {currentQuestion.points} points
                    </span>
                  </div>

                  {/* Multiple Choice/True-False Review */}
                  {(currentQuestion.type === "multiple-choice" || currentQuestion.type === "true-false") && currentQuestion.options && (
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
                                : "border-[#E8E8E8] bg-[#F5F5F5]"
                            }`}
                          >
                            <div className="mr-3 text-lg">
                              {isCorrectAnswer && "✅"}
                              {isUserAnswer && !isCorrectAnswer && "❌"}
                            </div>
                            <span>{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Code Review */}
                  {currentQuestion.type === "code" && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${
                        result?.correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                      }`}>
                        <p className="font-semibold">
                          {result?.correct ? "✅ Correct - All test cases passed" : "❌ Incorrect - Not all test cases passed"}
                        </p>
                      </div>
                      {currentQuestion.testCases && (
                        <div className="bg-white p-4 rounded-lg border border-[#E8E8E8]">
                          <h4 className="font-semibold mb-3">Test Cases:</h4>
                          {currentQuestion.testCases.map((tc, idx) => (
                            <div key={idx} className="text-sm mb-2 p-3 bg-[#F5F5F5] rounded">
                              <div><strong>Input:</strong> <code>{tc.input}</code></div>
                              <div><strong>Expected:</strong> <code>{tc.expected}</code></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fill Blank Review */}
                  {currentQuestion.type === "fill-blank" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-white border border-[#E8E8E8] rounded-lg">
                        <p><strong>Your Answer:</strong> {userAnswer || "(No answer provided)"}</p>
                        <p><strong>Expected:</strong> {currentQuestion.correctAnswer}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${
                        result?.correct ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"
                      }`}>
                        <p className="font-semibold">{result?.correct ? "✅" : "❌"} {result?.feedback}</p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center space-x-2 px-5 py-2.5 border border-[#E8E8E8] rounded-lg font-medium hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(examConfig.questions.length - 1, prev + 1)
                      )
                    }
                    disabled={currentQuestionIndex === examConfig.questions.length - 1}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-[#3B6B8C] text-white rounded-lg font-medium hover:bg-[#2F5570] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      );
    }

    // Results summary screen
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

            {/* Results */}
            <section className={`rounded-lg border-4 p-8 text-center ${
              passed ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
            }`}>
              <div className="mb-4">
                {passed ? (
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">
                {passed ? "🎉 Congratulations!" : "📚 Keep Practicing"}
              </h1>
              <p className="text-xl mb-6 text-[#1F1F1F]">
                You {passed ? "passed" : "did not pass"} the exam
              </p>
              
              <div className="bg-white rounded-lg p-6 mb-6 inline-block">
                <div className="text-4xl font-bold mb-2">
                  {score} / {examConfig.totalPoints}
                </div>
                <div className="text-2xl text-[#5C5C5C]">
                  {percentage.toFixed(1)}%
                </div>
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                {examConfig.allowReview && (
                  <button
                    onClick={() => {
                      setIsReviewing(true);
                      setCurrentQuestionIndex(0);
                    }}
                    className="w-full bg-[#3B6B8C] text-white py-3 rounded-lg font-semibold hover:bg-[#2F5570] transition-colors"
                  >
                    Review Answers
                  </button>
                )}
                <button
                  onClick={() => router.push("/courses/cs141")}
                  className="w-full border border-[#E8E8E8] py-3 rounded-lg font-semibold hover:bg-[#F5F5F5] transition-colors"
                >
                  Back to Course
                </button>
              </div>
            </section>
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
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F1F1F] flex">
      {/* Sidebar */}
      <ExamSidebar
        timeRemaining={timeRemaining}
        questions={examConfig.questions}
        currentIndex={currentQuestionIndex}
        setCurrentIndex={setCurrentQuestionIndex}
        answers={answers}
        codeQuestionPassed={codeQuestionPassed}
        flaggedQuestions={flaggedQuestions}
        onSubmit={confirmSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <main className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-[#E8E8E8] rounded-full h-2">
              <div
                className="bg-[#3B6B8C] h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Question Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Question {currentQuestionIndex + 1} of {examConfig.questions.length}
              </h2>
              <button
                onClick={() => toggleFlagQuestion(currentQuestion.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  flaggedQuestions.has(currentQuestion.id)
                    ? "bg-yellow-50 border-yellow-500 text-yellow-700"
                    : "border-[#E8E8E8] text-[#5C5C5C] hover:bg-[#F5F5F5]"
                }`}
              >
                <Flag className="w-4 h-4" />
                <span>{flaggedQuestions.has(currentQuestion.id) ? "Flagged" : "Flag"}</span>
              </button>
            </div>

            {/* Question Content */}
            <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
              <div className="flex justify-between items-start mb-6">
                <p className="text-lg font-medium">{currentQuestion.question}</p>
                <span className="text-sm text-[#5C5C5C] ml-4 whitespace-nowrap">
                  {currentQuestion.points} pts
                </span>
              </div>

              {/* Multiple Choice */}
              {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === idx 
                          ? "border-[#3B6B8C] bg-[#3B6B8C]/10" 
                          : "border-[#E8E8E8] bg-[#F5F5F5] hover:border-[#3B6B8C]"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={idx}
                        checked={answers[currentQuestion.id] === idx}
                        onChange={() => handleAnswerChange(currentQuestion.id, idx)}
                        className="mr-3 accent-[#3B6B8C]"
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
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === idx 
                          ? "border-[#3B6B8C] bg-[#3B6B8C]/10" 
                          : "border-[#E8E8E8] bg-[#F5F5F5] hover:border-[#3B6B8C]"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={idx}
                        checked={answers[currentQuestion.id] === idx}
                        onChange={() => handleAnswerChange(currentQuestion.id, idx)}
                        className="mr-3 accent-[#3B6B8C]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Fill in the Blank */}
              {currentQuestion.type === "fill-blank" && (
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full p-4 border border-[#D4D4D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40 bg-white"
                  placeholder="Type your answer here..."
                />
              )}

              {/* Code Question */}
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
                    <div className="mt-4 p-4 rounded-lg bg-green-50 text-green-800 border border-green-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">This question is complete! You can move to the next question.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2 px-5 py-2.5 border border-[#E8E8E8] rounded-lg font-medium hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              {isLastQuestion ? (
                <button
                  onClick={confirmSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSubmitting ? "Submitting..." : "Submit Exam"}</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-[#3B6B8C] text-white rounded-lg font-medium hover:bg-[#2F5570] transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="bg-white border-b border-[#E8E8E8]">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#3B6B8C]" />
            <span className="font-semibold text-lg">EduChatbot</span>
          </Link>
          <span className="text-sm text-[#999999]">|</span>
          <span className="text-sm font-medium">Practice Exam</span>
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

function ExamSidebar({
  timeRemaining,
  questions,
  currentIndex,
  setCurrentIndex,
  answers,
  codeQuestionPassed,
  flaggedQuestions,
  onSubmit,
  isSubmitting,
}: any) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <aside className="w-80 bg-white border-r border-[#E8E8E8] flex flex-col">
      {/* Time */}
      <div className="p-4 border-b border-[#E8E8E8]">
        <h3 className="text-sm font-semibold mb-2 text-[#5C5C5C]">TIME REMAINING</h3>
        <div className={`text-3xl font-bold ${
          timeRemaining < 300 ? "text-red-600" : "text-[#1F1F1F]"
        }`}>
          <div className="flex items-center space-x-2">
            <Clock className="w-6 h-6" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Question Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold mb-3 text-[#5C5C5C]">QUESTIONS</h3>
        <div className="grid grid-cols-4 gap-2">
          {questions.map((q: any, idx: number) => {
            const isAnswered = answers[q.id] !== undefined;
            const isPassed = codeQuestionPassed[q.id];
            
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium relative transition-colors ${
                  idx === currentIndex 
                    ? "bg-[#3B6B8C] text-white" 
                    : (isAnswered || isPassed)
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-[#F5F5F5] text-[#5C5C5C] hover:bg-[#E8E8E8]"
                }`}
              >
                {idx + 1}
                {flaggedQuestions.has(q.id) && (
                  <Flag className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 fill-yellow-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats & Submit */}
      <div className="p-4 border-t border-[#E8E8E8] space-y-4">
        <div className="text-sm space-y-1">
          <div className="flex justify-between text-[#5C5C5C]">
            <span>Answered:</span>
            <span className="font-medium">{Object.keys(answers).length} / {questions.length}</span>
          </div>
          <div className="flex justify-between text-[#5C5C5C]">
            <span>Flagged:</span>
            <span className="font-medium">{flaggedQuestions.size}</span>
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isSubmitting ? "Submitting..." : "Submit Exam"}</span>
        </button>
      </div>
    </aside>
  );
}

function ReviewSidebar({
  questions,
  currentIndex,
  setCurrentIndex,
  gradingResults,
  score,
  totalPoints,
  onBackToResults,
  onExit,
}: any) {
  return (
    <aside className="w-80 bg-white border-r border-[#E8E8E8] flex flex-col">
      {/* Score */}
      <div className="p-4 border-b border-[#E8E8E8]">
        <h3 className="text-sm font-semibold mb-2 text-[#5C5C5C]">YOUR SCORE</h3>
        <div className="text-3xl font-bold text-[#1F1F1F]">
          {score} / {totalPoints}
        </div>
      </div>

      {/* Question Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold mb-3 text-[#5C5C5C]">REVIEW</h3>
        <div className="grid grid-cols-4 gap-2">
          {questions.map((q: any, idx: number) => {
            const result = gradingResults[q.id];
            const isCorrect = result?.correct;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  idx === currentIndex ? "ring-2 ring-[#3B6B8C]" : ""
                } ${
                  isCorrect 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                } hover:opacity-80`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-[#E8E8E8] space-y-2">
        <button
          onClick={onBackToResults}
          className="w-full bg-[#5C5C5C] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1F1F1F] transition-colors"
        >
          Back to Results
        </button>
        <button
          onClick={onExit}
          className="w-full border border-[#E8E8E8] py-2.5 rounded-lg font-semibold hover:bg-[#F5F5F5] transition-colors"
        >
          Exit to Course
        </button>
      </div>
    </aside>
  );
}