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

## Planned / Not Yet Wired

The following models/providers were proposed as additional specialist agents to speed up parallel
work. None are connected yet — each requires a verified provider API key or Vercel AI Gateway
routing entry, plus an `.agent/*.agent.md` role definition, before they can be assigned real
subtasks. Do not reference these in workflow YAML or agent role files until wired.

| Candidate | Proposed role | Status |
|---|---|---|
| Sonar (Perplexity) | Live web research / fact-checking agent | Not connected — needs Perplexity API key |
| Gemini 3.7 Flash | Fast, low-cost auxiliary coder or summarizer | Not connected — needs Google AI/Vertex API key |
| Claude Sonnet (Anthropic, extended-thinking variant) | Secondary architecture review / reasoning-heavy tasks | Not connected — needs Anthropic API key |
| GLM (Zhipu, K-series) | Backup coder agent for cost diversification | Not connected — needs Zhipu API key; verify exact model name/version before wiring |
| Grok 4.6 (already listed above as flagship escalation) | Escalation-only architect | Partially documented above; still requires Gateway routing confirmation |
| Nemotron Ultra (NVIDIA) | Backup/local-inference coder agent | Not connected — needs NVIDIA NIM/API access; verify exact model name/version before wiring |

Before enabling any of these, confirm: (1) the exact current model name/version from the
provider's own documentation, (2) an active API key or Gateway route, and (3) a cost table entry
like the ones above.
