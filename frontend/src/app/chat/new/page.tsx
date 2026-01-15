// app/chat/new/page.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/app/components/ChatContext";
import Link from "next/link";
import { Sparkles, Send, User, Plus, MessageSquare, Clock, ArrowLeft } from "lucide-react";

export default function NewChatPage() {
  const router = useRouter();
  const { conversations, startConversation, addMessage } = useChat();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Send first message and create conversation
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const convId = Date.now().toString();
    const firstMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      content: text,
      conversationId: convId,
      timestamp: Date.now(),
    };

    const createdId = startConversation(
      text.slice(0, 40) + (text.length > 40 ? "..." : ""),
      firstMsg
    );

    setInput("");
    setLoading(true);

    // Navigate to the conversation immediately
    router.push(`/chat/${createdId}`);

    // Then fetch the AI response in the background
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [firstMsg] }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.content || "No response received.";

        const aiMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: reply,
          conversationId: createdId,
          timestamp: Date.now(),
        };

        addMessage(createdId, aiMsg);
      }
    } catch (err) {
      console.error("Failed to get AI response:", err);
      const errMsg = {
        id: (Date.now() + 2).toString(),
        role: "assistant" as const,
        content: "⚠️ Error: Unable to connect to AI.",
        conversationId: createdId,
        timestamp: Date.now(),
      };
      addMessage(createdId, errMsg);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F1F1F] flex">
      {/* Sidebar */}
      <Sidebar conversations={conversations} activeId="new" />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <TopBar />

        <main className="flex-1 flex flex-col px-6 py-6 max-w-5xl w-full mx-auto">
          <div className="flex-1 rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 pb-4 border-b border-[#E8E8E8]">
              New Conversation
            </h2>

            {/* Empty State */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-[#3B6B8C]" />
                <h3 className="text-xl font-semibold mb-2">Start a new conversation</h3>
                <p className="text-[#5C5C5C] mb-6">
                  Ask a question about math, CS, physics, or any subject to get started.
                </p>
              </div>
            </div>

            {/* Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="border-t border-[#E8E8E8] pt-4"
            >
              <div className="flex gap-3 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Type your message..."
                  disabled={loading}
                  rows={3}
                  autoFocus
                  className="flex-1 resize-none rounded-lg border border-[#D4D4D4] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40 disabled:opacity-60 bg-white"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-medium transition-colors ${
                    loading || !input.trim()
                      ? "bg-[#E8E8E8] text-[#999999] cursor-not-allowed"
                      : "bg-[#3B6B8C] hover:bg-[#2F5570] text-white"
                  }`}
                >
                  <span>{loading ? "..." : "Send"}</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
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
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-[#5C5C5C] hover:bg-[#F5F5F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

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

function Sidebar({
  conversations,
  activeId,
}: {
  conversations: any[];
  activeId: string;
}) {
  const router = useRouter();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const handleNewChat = () => {
    router.push("/chat/new");
  };

  return (
    <aside className="w-80 bg-white border-r border-[#E8E8E8] flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#E8E8E8]">
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-lg font-medium bg-[#3B6B8C] hover:bg-[#2F5570] text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#5C5C5C] mb-3 px-2">
          Recent Conversations
        </h3>

        {conversations.length === 0 ? (
          <div className="text-center py-8 text-[#999999] text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to get started</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className={`block p-3 rounded-lg transition-colors ${
                conv.id === activeId
                  ? "bg-[#3B6B8C]/10 border border-[#3B6B8C]"
                  : "hover:bg-[#F5F5F5] border border-transparent"
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-medium text-sm line-clamp-1 flex-1">
                  {conv.title}
                </h4>
              </div>
              <div className="flex items-center text-xs text-[#999999]">
                <Clock className="w-3 h-3 mr-1" />
                <span>{formatTimestamp(conv.updatedAt)}</span>
              </div>
              {conv.messages.length > 0 && (
                <p className="text-xs text-[#5C5C5C] mt-2 line-clamp-2">
                  {conv.messages[conv.messages.length - 1].content}
                </p>
              )}
            </Link>
          ))
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#E8E8E8]">
        <Link
          href="/"
          className="block text-center text-sm text-[#3B6B8C] hover:text-[#2F5570] font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </aside>
  );
}
