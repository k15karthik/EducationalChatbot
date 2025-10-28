import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "",
    "X-Title": process.env.OPENROUTER_SITE_NAME || "",
  },
});

export async function POST(req: Request) {
  try {
    const { question, studentAnswer } = await req.json();

    const prompt = `
    You are an encouraging C++ tutor.
    Grade the student's answer to the following question and respond in strict JSON format:
    {
      "correct": true or false,
      "feedback": "Nice try, but ... or Great job! ..."
    }
    
    If the answer is incorrect, always begin the feedback with 'Nice try, but ...'
    Question: "${question}"
    Answer: "${studentAnswer}"
    `;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(
      text.replace(/```json|```/g, "").trim()
    );

    return Response.json(parsed);
  } catch (error) {
    console.error("Grading error:", error);
    return Response.json(
      { correct: false, feedback: "Error grading your response." },
      { status: 500 }
    );
  }
}
