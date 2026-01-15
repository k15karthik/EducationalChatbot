import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // replace with your deployed site later
    "X-Title": "Edu-Chatbot", // app name for OpenRouter rankings
  },
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Insert a system prompt so AI behaves like your Edu-Chatbot
    const systemPrompt = {
      role: "system",
      content:
        "You are Edu-Chatbot, a friendly and knowledgeable AI tutor that helps students understand course materials, programming concepts, and assignments. " +
        "Keep your answers concise, clear, and focused on helping students learn.",
    };

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // You can switch to 'mistralai/mistral-7b-instruct' if you want free tier
      messages: [systemPrompt, ...messages],
      max_tokens: 300, // limits length of replies
      temperature: 0.7, // creativity level
    });

    const content = completion.choices[0].message.content;
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
