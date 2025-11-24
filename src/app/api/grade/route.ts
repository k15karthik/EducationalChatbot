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
    const { question, expectedAnswer, studentAnswer } = await req.json();

    const prompt = `
You are a kind, encouraging C++ tutor who gives feedback like a real teacher.
Evaluate the student's answer carefully.
Rules:
- If the student's answer is mostly correct, respond with short, positive feedback.
  Example: "Great job! You clearly understand this concept."
  Do NOT ask additional questions when the student is correct.
- If the answer is incomplete or wrong:
  - Start feedback with "Nice try, but..."
  - Ask 1–2 short guiding questions that help the student reflect or recall the right concept.
  - Your questions should guide thinking WITHOUT giving away the answer.
  - Do NOT use examples that are identical or too similar to the original question context.
  - Focus on the KEY CHARACTERISTIC of what makes the answer correct (e.g., "whole numbers", "decimal values", "true/false", etc.)
  - NEVER reveal the correct answer, data type name, or give obvious hints that directly lead to it.
- Keep your feedback under 3 sentences.
- Output ONLY valid JSON like this:
{
  "correct": true or false,
  "feedback": "Your feedback text here"
}
Question: "${question}"
Expected Answer: "${expectedAnswer}"
Student Answer: "${studentAnswer}"
`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    return Response.json(parsed);
  } catch (error) {
    console.error("Grading error:", error);
    return Response.json(
      { correct: false, feedback: "Error grading your response." },
      { status: 500 }
    );
  }
}