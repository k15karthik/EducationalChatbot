"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

interface CodeQuestionProps {
  question: string;
  testCases: { input: string; expected: string }[];
  starter?: string;
  onPass: () => void;
}

export default function CodeQuestion({
  question,
  testCases,
  starter,
  onPass,
}: CodeQuestionProps) {
  const getStarterTemplate = (q: string) => `#include <iostream>
using namespace std;

// TODO: ${q}
// - Implement a function that fulfills the description above.
// - Use main() to take inputs and call your function.
// - Print the output clearly.
// Write comment here

void yourFunctionName() {
    // Write comment here
}

int main() {
    // TODO: Call yourFunctionName() with example inputs and print the output.
    return 0;
}`;

  const [code, setCode] = useState(starter || getStarterTemplate(question));
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<
    Array<{ input: string; expected: string; output: string; passed: boolean }>
  >([]);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);
  const [aiHint, setAiHint] = useState<string | null>(null);

  // Reset everything when the question changes
  useEffect(() => {
    setCode(starter || getStarterTemplate(question));
    setResults([]);
    setAllPassed(null);
    setAiHint(null);
  }, [starter, question]);

  const handleRun = async () => {
    setLoading(true);
    setAiHint(null);

    try {
      const res = await axios.post("/api/run", { code, testCases });
      setResults(res.data.results || []);
      setAllPassed(res.data.allPassed || false);
      setAiHint(res.data.aiHint || null);

      if (res.data.allPassed) {
        onPass();
      }
    } catch {
      setAiHint("⚠️ Error: Could not connect to evaluator API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-6 bg-gray-50 mb-8">
      <h3 className="text-lg font-semibold mb-2">💻 {question}</h3>

      <Editor
        height="350px"
        language="cpp"
        theme="vs-light"
        value={code}
        onChange={(v) => setCode(v || "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />

      <button
        onClick={handleRun}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:brightness-110"
      >
        {loading ? "Running..." : "Run Code"}
      </button>

      {results.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Results</h4>
          {results.map((r, i) => (
            <div key={i} className="border p-3 rounded-lg mb-2 bg-white">
              <p>
                <b>Input:</b> <code>{r.input}</code>
              </p>
              <p>
                <b>Expected:</b> <code>{r.expected}</code>
              </p>
              <p>
                <b>Output:</b> <code>{r.output}</code>
              </p>
              <p className={r.passed ? "text-green-600" : "text-red-600"}>
                {r.passed ? "✅ Passed" : "❌ Failed"}
              </p>
            </div>
          ))}

          {allPassed !== null && (
            <div
              className={`mt-3 p-4 rounded-lg ${
                allPassed
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {allPassed
                ? "🎉 All test cases passed! Great job!"
                : "Nice try, but review the failing cases and try again."}
            </div>
          )}

          {aiHint && !allPassed && (
            <div className="mt-3 p-4 rounded-lg bg-blue-50 text-blue-900">
              <p className="font-medium whitespace-pre-wrap">{aiHint}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}