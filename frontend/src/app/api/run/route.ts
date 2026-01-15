import { NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

// ✅ Optional AI feedback via OpenRouter
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "",
    "X-Title": process.env.OPENROUTER_SITE_NAME || "Edu-Chatbot",
  },
});

type TestCase = { input: string; expected: string };

export async function POST(req: Request) {
  try {
    const { code, testCases, language = "cpp" } = (await req.json()) as {
      code: string;
      testCases: TestCase[];
      language?: string;
    };

    if (!code || !Array.isArray(testCases)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload." },
        { status: 400 }
      );
    }

    const results: Array<TestCase & { output: string; passed: boolean }> = [];

    for (const t of testCases) {
      const resp = await axios.post(PISTON_API, {
        language,
        version: "10.2.0",
        files: [{ name: "main.cpp", content: code }],
        stdin: t.input,
      });

      const output = String(resp.data?.run?.output ?? "").trim();
      const passed = output === t.expected.trim();
      results.push({ ...t, output, passed });
    }

    const allPassed = results.every((r) => r.passed);

    let aiHint: string | null = null;

    if (!allPassed && process.env.OPENROUTER_API_KEY) {
      // Compose a short, Socratic hint
      const failed = results.filter((r) => !r.passed);
      const hintPrompt = `
You are a helpful C++ tutor. The student's code failed some test cases.

Rules:
- Start with "Nice try, but..."
- Do NOT reveal the solution.
- Give 2 concise guiding questions or hints.
- Keep it under 3 sentences total.

Student code:
\`\`\`cpp
${code}
\`\`\`

Failed test cases:
${failed
  .map(
    (f) =>
      `- input: ${JSON.stringify(f.input)} | expected: ${JSON.stringify(
        f.expected
      )} | output: ${JSON.stringify(f.output)}`
  )
  .join("\n")}
`;

      try {
        const comp = await openrouter.chat.completions.create({
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: hintPrompt }],
          temperature: 0.7,
        });
        aiHint = comp.choices?.[0]?.message?.content ?? null;
      } catch {
        aiHint = null;
      }
    }

    return NextResponse.json({ success: true, results, allPassed, aiHint });
  } catch (e) {
    console.error("Runner error:", e);
    return NextResponse.json(
      { success: false, error: "Execution failed." },
      { status: 500 }
    );
  }
}
