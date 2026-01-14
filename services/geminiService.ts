// services/geminiService.ts
// Local-only OpenAI replacement for Gemini
// Safe for personal use with Vite (.env.local)

import { InspectionResult } from "../types";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing VITE_OPENAI_API_KEY in .env.local");
}

export async function analyzeInspectionReport(
  reportText: string
): Promise<InspectionResult[]> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
You are a senior fire sprinkler inspector.
Extract ONLY actionable deficiencies from inspection reports.

Rules:
- Ignore compliant, informational, or pass items
- Normalize wording
- Quantities must be numeric
- Output must be valid JSON ONLY
- No markdown, no explanations

JSON schema:
[
  {
    "category": string,
    "section": string,
    "deviceType": string,
    "location": string,
    "issue": string,
    "quantity": number,
    "actionRequired": string
  }
]
          `.trim(),
        },
        {
          role: "user",
          content: reportText,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No response content from OpenAI");
  }

  try {
    return JSON.parse(content) as InspectionResult[];
  } catch (e) {
    console.error("Raw model output:", content);
    throw new Error("Failed to parse AI response as JSON");
  }
}
