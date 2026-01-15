// app/courses/cs141/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, User, ArrowLeft, BookOpen, Code, MessageSquare, Users, CheckCircle } from "lucide-react";
import { LessonsAPI, LessonCompletion } from "@/lib/api/progress";

export default function CS141Page() {
  const router = useRouter();

  // Progress state
  const [progress, setProgress] = useState<LessonCompletion[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const lessons = [
    { id: "lesson1", title: "Lesson 1: Variables and Data Types" },
  ];

  // Fetch progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoadingProgress(false);
          return;
        }
        const data = await LessonsAPI.getCourseProgress("cs141");
        setProgress(data);
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, []);

  // Helper functions for progress
  const isLessonCompleted = (lessonId: string): boolean => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getLessonScore = (lessonId: string): number | null => {
    const lessonProgress = progress.find(p => p.lesson_id === lessonId);
    return lessonProgress?.quiz_score ?? null;
  };

  const assignments = [
    { title: "8:00 AM Coding Test", href: "/courses/cs141/exam", urgent: true },
    { title: "Lesson 1: Variables and Data Types", href: "/courses/cs141/lesson1", urgent: false },
  ];

  const quickActions = [
    { 
      label: "Practice IDE", 
      href: "/courses/cs141/practice-ide",
      icon: Code,
      description: "Write and test code"
    },
    { 
      label: "Practice Exam", 
      href: "/courses/cs141/exam",
      icon: BookOpen,
      description: "Test your knowledge"
    },
    { 
      label: "Ask AI", 
      href: "/chat/new",
      icon: MessageSquare,
      description: "Get help from AI"
    },
    { 
      label: "Discussion", 
      href: "https://piazza.com/class/lr12s7wojy73ob#",
      icon: Users,
      description: "Join class discussion",
      external: true
    },
  ];

  const handleActionClick = (action: any) => {
    if (action.external) {
      window.open(action.href, "_blank");
      return;
    }

    // Ask AI → always create a new chat ID
    if (action.href === "/chat") {
      const chatId = Date.now().toString();
      router.push(`/chat/${chatId}?course=cs141`);
      return;
    }

    router.push(action.href);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F1F1F]">
      <TopBar />
      
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-[#3B6B8C] hover:text-[#2F5570] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          {/* Course Header */}
          <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">CS 141</h1>
                <p className="text-[#5C5C5C]">Program Design II</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#5C5C5C]">Fall 2025</div>
                <div className="text-sm font-medium text-[#3B6B8C]">In Progress</div>
              </div>
            </div>
          </section>

          {/* Assignments */}
          <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
            <h2 className="text-lg font-semibold mb-4">Assignments</h2>
            <div className="space-y-3">
              {assignments.map((assignment, index) => (
                <Link
                  key={index}
                  href={assignment.href}
                  className="block p-4 rounded bg-[#F5F5F5] border border-[#E8E8E8] hover:border-[#3B6B8C] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${assignment.urgent ? 'text-[#DC2626]' : 'text-[#1F1F1F]'}`}>
                      {assignment.title}
                    </span>
                    {assignment.urgent && (
                      <span className="text-xs px-2 py-1 rounded bg-[#DC2626]/10 text-[#DC2626] font-medium">
                        Due Soon
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Two Column Layout: Practice Skills + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Practice Skills - 2/3 width */}
            <section className="lg:col-span-2 rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
              <h2 className="text-lg font-semibold mb-4">Practice Skills</h2>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {lessons.map((lesson) => {
                  const completed = isLessonCompleted(lesson.id);
                  const score = getLessonScore(lesson.id);

                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/cs141/${lesson.id}`}
                      className="block p-3 rounded bg-[#F5F5F5] border border-[#E8E8E8] hover:border-[#3B6B8C] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#3B6B8C]">
                          {lesson.title}
                        </span>
                        {completed && (
                          <div className="flex items-center space-x-2">
                            {score !== null && (
                              <span className="text-xs text-[#5C5C5C] font-medium">{score}%</span>
                            )}
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Quick Actions - 1/3 width */}
            <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-5">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-[#5C5C5C]">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action)}
                    className="w-full text-left flex items-start space-x-3 p-3 rounded transition-colors hover:bg-[#F5F5F5]"
                  >
                    <action.icon className="w-5 h-5 text-[#3B6B8C] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{action.label}</div>
                      <div className="text-xs text-[#5C5C5C]">{action.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
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
          <span className="text-sm font-medium">CS 141</span>
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