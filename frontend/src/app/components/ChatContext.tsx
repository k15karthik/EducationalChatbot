"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  conversationId: string;
  timestamp: number;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  startConversation: (title: string, firstMessage: Message) => string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const setActiveConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const addMessage = (conversationId: string, message: Message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: Date.now(),
            }
          : conv
      )
    );
  };

  const startConversation = (title: string, firstMessage: Message) => {
    const id = Date.now().toString();
    const newConv: Conversation = {
      id,
      title,
      messages: [firstMessage],
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(id);
    return id;
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        setActiveConversation,
        addMessage,
        startConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
