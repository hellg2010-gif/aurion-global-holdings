# AURION Agent Memory Log

Persistent, append-only log of orchestrator/agent decisions across sessions. Every agent should
append a dated entry here after completing a subtask, so future runs have continuity instead of
re-deriving context from scratch.

## Format
```
## YYYY-MM-DD — <issue/PR link>
- Agent: <orchestrator | architect-grok | coder-deepseek | reviewer>
- Task:
- Decision/Outcome:
- Follow-ups:
```

## Log

## 2026-08-16 — scaffold
- Agent: orchestrator
- Task: Initial multi-agent orchestration scaffold created (Grok architect, DeepSeek coder,
  reviewer, GitHub Agentic Workflow, Vercel AI Gateway routing rules).
- Decision/Outcome: Scaffold added via PR on `feature/agentic-orchestration-scaffold`.
- Follow-ups: Add `AI_GATEWAY_API_KEY` secret, implement `.agent/scripts/plan.mjs`, link this
  repo to a Vercel project so Gateway env vars are available at build/runtime.
