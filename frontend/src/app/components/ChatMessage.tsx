type Props = {
    role: "user" | "assistant";
    content: string;
  };
  
  export default function ChatMessage({ role, content }: Props) {
    const isUser = role === "user";
    return (
      <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm border
          ${isUser ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-black"}`}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
      </div>
    );
  }
  