"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I’m your Edu-Chatbot assistant. Ask me anything about your courses.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Send message to API
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const newMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("Failed to get response from API");

      const data = await res.json();
      const reply = data.content || "No response received.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error: Unable to connect to AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Press Enter to send
  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Top Navbar */}
      <header className="flex justify-between items-center px-10 py-4 bg-white">
        <a
          href="/courses/cs141"
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back to CS 141
        </a>
        <h1 className="text-2xl font-bold">Ask AI</h1>
        <div className="w-24" /> {/* Spacer */}
      </header>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col px-6 py-4 overflow-hidden">
        <div ref={listRef} className="flex-1 overflow-y-auto px-6 space-y-6">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex w-full ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-base shadow-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-black rounded-bl-none"
                }`}
              >
                {/* Markdown Renderer */}
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ children }) {
                        return (
                          <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        );
                      },
                      pre({ children }) {
                        return (
                          <pre className="bg-gray-100 rounded-lg p-3 overflow-x-auto text-sm font-mono border border-gray-200">
                            {children}
                          </pre>
                        );
                      },
                      ul({ children }) {
                        return (
                          <ul className="list-disc list-inside ml-4 text-gray-800">
                            {children}
                          </ul>
                        );
                      },
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-500 italic text-sm">AI is thinking...</div>
          )}
        </div>

        {/* Input Box */}
        <div className="w-full px-6 mt-3 mb-6">
          <div className="max-w-4xl mx-auto flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type your question..."
              disabled={loading}
              className="flex-1 resize-none h-20 rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:brightness-110 h-fit disabled:opacity-50"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
