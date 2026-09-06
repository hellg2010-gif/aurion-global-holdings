#!/usr/bin/env node

const GATEWAY_URL = "https://gateway.ai.vercel.app/v1/chat/completions";
const MODEL = "xai/grok-4.3";

const SYSTEM_PROMPT = `You are the AURION orchestrator agent. Decompose the incoming GitHub
issue into atomic subtasks. For each subtask, assign an agent using these rules:
- architecture, compliance, trade/LC research, or ambiguous design decisions -> "architect-grok"
- Prisma schema, NestJS boilerplate, DTOs, unit/e2e tests, routine CRUD -> "coder-deepseek"
- pure repo mechanics (branch, PR, label) -> "github-native" (no model call needed)

Return ONLY valid JSON in this shape:
{
  "summary": "one sentence restating the request",
  "subtasks": [
    { "title": "string", "agent": "architect-grok|coder-deepseek|github-native", "notes": "string" }
  ]
}`;

function parsePlanContent(content, issueTitle) {
  const normalized = content
    .trim()
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "");

  try {
    JSON.parse(normalized);
    return normalized;
  } catch {
    return JSON.stringify({ summary: issueTitle, subtasks: [], raw: normalized || content });
  }
}

async function main() {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    console.error("Missing AI_GATEWAY_API_KEY");
    process.exit(1);
  }

  const issueTitle = process.env.ISSUE_TITLE || "";
  const issueBody = process.env.ISSUE_BODY || "";

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: ["Bearer", apiKey].join(" "),
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Issue title: ${issueTitle}\n\nIssue body:\n${issueBody}` },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    console.error(`Gateway request failed: ${response.status} ${await response.text()}`);
    process.exit(1);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";

  console.log(parsePlanContent(content, issueTitle));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
