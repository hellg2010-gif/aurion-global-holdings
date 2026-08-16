# Model & Agent Routing Rules — AURION

This defines how the orchestrator decides which model/agent handles a given subtask, and how
Vercel AI Gateway should route the underlying API calls.

## Routing table

| Task type | Agent | Model | Why |
|---|---|---|---|
| Architecture / service design | architect-grok | grok-4.3 | Best agentic reasoning + tool use for design tradeoffs |
| Trade compliance / LC / regulatory research | architect-grok | grok-4.3 (+ web/X search) | Needs live, current information |
| Hardest cross-cutting decisions | architect-grok | grok-4.6 (flagship, escalation only) | Reserve for genuinely hard problems — highest cost tier |
| Prisma schema, NestJS boilerplate, DTOs | coder-deepseek | deepseek-v4-flash | Cheapest, high volume, low complexity |
| Business-logic-heavy service code | coder-deepseek | deepseek-v4-pro | More capable than Flash, still far cheaper than Grok |
| Unit / e2e test generation | coder-deepseek | deepseek-v4-flash | Repetitive, well-specified |
| PR-level code review | reviewer + GitHub Copilot | grok-4.3 + Copilot review | Second independent pass before merge |
| Repo mechanics (branches, PRs, issue triage) | GitHub Agentic Workflow | n/a (GitHub native) | No LLM call needed for pure git operations |

## Vercel AI Gateway configuration

Set these as Vercel project environment variables / Gateway routing rules:

- `AI_GATEWAY_DEFAULT_PROVIDER=xai` for architect subtasks, `deepseek` for coder subtasks.
- Enable **cost-based provider sorting** so Gateway falls back automatically if a provider is
  degraded, without hardcoding fallback logic in the agents.
- Cache identical planning prompts (e.g. repeated compliance lookups) via Gateway semantic
  caching to avoid re-paying for the same Grok tool call.

## Cost guardrails (approximate, revisit quarterly)

- DeepSeek V4-Flash: ~$0.14 / $0.28 per 1M tokens (in/out) — default for coder agent.
- DeepSeek V4-Pro: ~$0.44 / $0.87 per 1M tokens — use when Flash output fails review twice.
- Grok 4.3: ~$1.25 / $2.50 per 1M tokens — default for architect agent.
- Grok 4.6 (flagship): ~$2 / $6 per 1M tokens — escalation only, requires orchestrator sign-off.
- Grok web/X/tool search: ~$5 per 1,000 calls — batch research questions to minimize calls.
