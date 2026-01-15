// app/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Send,
  Clock,
  Sparkles,
  User,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [username, setUsername] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasCheckedAuth = useRef(false);

  const courses = [
    { code: "CS 141", title: "Program Design II", path: "/courses/cs141" },
    { code: "Math 210", title: "Calculus III", path: "/courses/math210" },
    { code: "CS 151", title: "Mathematical Foundations of Computing", path: "/courses/cs151" },
    { code: "PHYS 131", title: "Introductory Physics for Life Sciences I", path: "/courses/phys131" },
  ];

  const recentChats = [
    {
      id: 1,
      subject: "CS 141",
      preview: "How do I implement a binary search tree in C++?",
      timestamp: "2 hours ago",
      color: "blue"
    },
    {
      id: 2,
      subject: "Math 210",
      preview: "Explain the divergence theorem with an example",
      timestamp: "5 hours ago",
      color: "green"
    },
    {
      id: 3,
      subject: "CS 151",
      preview: "What's the difference between NP and NP-complete?",
      timestamp: "Yesterday",
      color: "purple"
    },
    {
      id: 4,
      subject: "PHYS 131",
      preview: "Calculate the kinetic energy of a falling object",
      timestamp: "Yesterday",
      color: "orange"
    },
    {
      id: 5,
      subject: "CS 141",
      preview: "Debugging segmentation fault in my linked list code",
      timestamp: "2 days ago",
      color: "blue"
    }
  ];

  // Check if user is logged in
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    
    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (q) {
      setQuestion("");
      router.push(`/chat?q=${encodeURIComponent(q)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F1F1F]">
      <TopBar username={username} onLogout={handleLogout} />
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <CoursesSection courses={courses} />
          <NewQuestionPanel 
            question={question}
            setQuestion={setQuestion}
            handleSubmit={handleSubmit}
            inputRef={inputRef}
          />
          <RecentChatsSection chats={recentChats} />
        </div>
      </main>
    </div>
  );
}

function TopBar({ username, onLogout }: { username: string; onLogout: () => void }) {
  return (
    <header className="bg-white border-b border-[#E8E8E8]">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#3B6B8C]" />
            <span className="font-semibold text-lg">EduChatbot</span>
          </div>
          <span className="text-sm text-[#999999]">|</span>
          <span className="text-sm font-medium">Home</span>
        </div>
        <div className="flex items-center space-x-4"> 
          {username && (
            <span className="text-sm text-[#5C5C5C]">
              Welcome, <span className="font-medium text-[#1F1F1F]">{username}</span>
            </span>
          )}
          <Link
            href="/profile"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#1F1F1F] transition-colors border border-[#E8E8E8]"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
          <button
            onClick={onLogout}
            className="text-sm text-[#5C5C5C] hover:text-[#1F1F1F] font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function CoursesSection({ courses }: { courses: any[] }) {
  return (
    <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
      <h2 className="text-lg font-semibold mb-4">Your Courses</h2>
      <div className="grid grid-cols-2 gap-3">
        {courses.map((course) => (
          <Link
            key={course.code}
            href={course.path}
            className="p-4 rounded bg-[#F5F5F5] border border-[#E8E8E8] hover:border-[#3B6B8C] transition-colors"
          >
            <div className="font-semibold mb-1 text-[#3B6B8C]">{course.code}</div>
            <div className="text-sm text-[#5C5C5C]">{course.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NewQuestionPanel({ 
  question, 
  setQuestion, 
  handleSubmit,
  inputRef
}: {
  question: string;
  setQuestion: (q: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}) {
  return (
    <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
      <h2 className="text-lg font-semibold mb-4">Start a New Question</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about math, CS, physics, or any subject..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border resize-none bg-white border-[#D4D4D4] text-[#1F1F1F] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40"
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={!question.trim()}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
              question.trim()
                ? 'bg-[#3B6B8C] hover:bg-[#2F5570] text-white'
                : 'bg-[#E8E8E8] text-[#999999] cursor-not-allowed'
            }`}
          >
            <span>Submit</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </section>
  );
}

function RecentChatsSection({ chats }: { chats: any[] }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-[#3B6B8C]/10 text-[#3B6B8C]',
    green: 'bg-[#5F8D6B]/10 text-[#5F8D6B]',
    purple: 'bg-[#7B68A7]/10 text-[#7B68A7]',
    orange: 'bg-[#D89560]/10 text-[#D89560]',
  };
  
  return (
    <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Conversations</h2>
        <Link 
          href="/chats" 
          className="text-sm font-medium text-[#3B6B8C] hover:text-[#2F5570]"
        >
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className="block p-4 rounded bg-[#F5F5F5] border border-[#E8E8E8] hover:border-[#3B6B8C] transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`text-xs font-medium px-2 py-1 rounded ${colorMap[chat.color]}`}>
                {chat.subject}
              </span>
              <span className="text-xs flex items-center text-[#999999]">
                <Clock className="w-3 h-3 mr-1" />
                {chat.timestamp}
              </span>
            </div>
            <p className="text-sm line-clamp-2 text-[#5C5C5C]">{chat.preview}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}