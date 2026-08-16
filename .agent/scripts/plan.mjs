#!/usr/bin/env node
// .agent/scripts/plan.mjs
// Calls the orchestrator model (Grok, via Vercel AI Gateway) to turn a GitHub issue
// into a structured subtask plan, following the routing rules in ../ROUTING.md.
//
// Requires env vars:
//   AI_GATEWAY_API_KEY  - Vercel AI Gateway API key
//   ISSUE_TITLE         - injected by the GitHub Actions workflow
//   ISSUE_BODY          - injected by the GitHub Actions workflow
//
// Output: a JSON plan printed to stdout, consumed by .github/workflows/agentic-feature.yml

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

async function main() {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    console.error("Missing AI_GATEWAY_API_KEY");
    process.exit(1);
  }

  const issueTitle = process.env.ISSUE_TITLE || "";
  const issueBody = process.env.ISSUE_BODY || "";

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
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

  if (!res.ok) {
    console.error(`Gateway request failed: ${res.status} ${await res.text()}`);
    process.exit(1);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";

  try {
    JSON.parse(content);
    console.log(content);
  } catch {
    console.log(JSON.stringify({ summary: issueTitle, subtasks: [], raw: content }));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
