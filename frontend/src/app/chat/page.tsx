// app/chat/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChat } from "@/app/components/ChatContext";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get('q');
  
  const { conversations, startConversation, addMessage } = useChat();
  const hasCreatedConversation = useRef(false);

  // Initialize conversation with the question from URL
  useEffect(() => {
    if (initialQuestion && !hasCreatedConversation.current) {
      hasCreatedConversation.current = true;

      // Check if a conversation with this question already exists to prevent duplicates
      const existingConv = conversations.find(c => 
        c.messages.length > 0 && c.messages[0].content === initialQuestion
      );

      if (existingConv) {
        // If it already exists, just navigate to it
        router.replace(`/chat/${existingConv.id}`);
        return;
      }

      const convId = Date.now().toString();
      const firstMsg = {
        id: Date.now().toString(),
        role: "user" as const,
        content: initialQuestion,
        conversationId: convId,
        timestamp: Date.now(),
      };
      
      const createdId = startConversation(
        initialQuestion.slice(0, 40) + (initialQuestion.length > 40 ? "..." : ""),
        firstMsg
      );

      // Navigate to the conversation immediately
      router.replace(`/chat/${createdId}`);

      // Send the initial question to the API
      const sendInitialMessage = async () => {
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
        }
      };

      sendInitialMessage();
    }
  }, [initialQuestion]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F1F1F] transition-colors">
      <header className="bg-white border-b border-[#E8E8E8] transition-colors">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#3B6B8C]" />
              <span className="font-semibold text-lg">EduChatbot</span>
            </Link>
            <span className="text-sm text-[#999999]">|</span>
            <span className="text-sm font-medium">Chat</span>
          </div>
        </div>
      </header>
      
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6 transition-colors">
            <h2 className="text-lg font-semibold mb-4">
              {initialQuestion ? "Starting conversation..." : "Loading..."}
            </h2>
            <div className="text-center py-12 text-[#5C5C5C]">
              <p>Setting up your chat...</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}