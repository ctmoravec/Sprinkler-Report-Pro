// services/geminiService.ts
// OpenAI-backed replacement, API-compatible with existing App.tsx

import { InspectionResult } from "../types";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing VITE_OPENAI_API_KEY in .env.local");
}

async function callOpenAI(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
You are a senior NICET III fire sprinkler estimator.
Extract only actionable deficiencies from inspection reports.
Return valid JSON only. No markdown. No commentary.
          `.trim(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Matches existing import in App.tsx
 */
export async function parseSprinklerReport(
  reportText: string
): Promise<InspectionResult[]> {
  const raw = await callOpenAI(reportText);

  try {
    return JSON.parse(raw);
  } catch {
    console.error("Raw OpenAI output:", raw);
    throw new Error("AI response was not valid JSON");
  }
}

/**
 * Stubbed for now so the app compiles.
 * You can implement this later if needed.
 */
export async function queryEstimator(_query: string): Promise<string> {
  return "Estimator query support coming soon.";
}
