# AURION AI Routing & Connector Governance

## Purpose

This policy assigns work to the smallest, safest, lowest-cost capable model and connector set. It supports AURION's e-commerce, logistics, trade-finance, warehouse, fulfillment, and cross-border operations.

No model or connector is trusted as a system of record. Material facts, calculations, compliance conclusions, and deployment changes require the evidence and approval gates below.

## Model routing

| Workload | Primary | Fallback | Required guardrails |
|---|---|---|---|
| Architecture, system design, complex trade or market research | Grok | Claude or GPT | Cite external sources; identify assumptions; require human approval for architecture decisions |
| Product requirements, business analysis, customer-facing chat | GPT | Gemini | Apply retrieval grounding; never promise operational, legal, or financial outcomes |
| Bulk implementation, tests, repetitive refactors | DeepSeek Flash | DeepSeek Pro | Run typecheck, lint, unit tests, dependency audit and code review |
| Repository implementation, PR fixes and code review | GitHub Copilot | Claude or GPT | Branch/PR workflow only; CI must pass; no direct production changes |
| Long documents, policies, contracts and structured review | Claude | GPT | Extract claims; retain citations; flag legal/compliance review as human-required |
| Multimodal operations: invoices, labels, images and video | Gemini | GPT | Validate extracted values against source; redact sensitive data before model use |
| Internal knowledge retrieval | RAG service (vector store + approved embeddings) | Claude/GPT with cited context | Return source links/record IDs; state when evidence is absent |
| Sensitive KYC, identity, contracts or payment data | Approved private/self-hosted model only | None | Data classification, least privilege, encryption, audit logging and human approval |

## Provider-neutral gateway policy

- Route model requests through the approved AI gateway rather than embedding provider keys in application code.
- Prefer a low-cost/low-latency model when evaluation quality satisfies the task threshold.
- Use explicit provider fallbacks for availability; do not silently change a high-risk workflow's model without logging it.
- Store prompts, model version, input classification, tool calls, output, evaluation result and cost/latency telemetry in the audit stream.
- Never place API keys, personal data, payment data, private keys, or production credentials in prompts, issues, PRs, logs, fixtures, or agent memory.

## Agent roles and handoffs

1. **Planner** defines the objective, constraints, acceptance criteria, risk class, data class and evidence standard.
2. **Researcher** gathers primary or independent sources and separates facts, estimates and assumptions.
3. **Architect** proposes a modular design, dependency impact, rollout and rollback plan.
4. **Builder** implements only the approved scoped task on a feature branch.
5. **Verifier** runs tests, security checks, data-quality checks and calculation checks.
6. **Red team** challenges unsafe assumptions, abuse cases, security gaps, financial downside and operational failure modes.
7. **Human approver** decides on production releases, financial actions, legal/compliance conclusions, identity/KYC decisions, payments and destructive changes.

## Quality gates

### Evidence and reasoning

- Label statements as fact, calculation, estimate, recommendation or assumption.
- Use primary sources first for regulatory, legal, financial, pricing and product-policy claims.
- Cross-check material facts with an independent source where feasible.
- Check dates, currencies, units, formulas, citations, contradictions and uncertainty before release.
- For financial analyses, retain inputs, formulas, sensitivity cases and source dates. Do not present NPV, IRR, DSCR, VaR, credit, AML or capital-adequacy outputs as approved decisions without qualified human review.

### Security and privacy

- Apply least privilege, RBAC/ABAC, MFA where available, encryption in transit and at rest, secrets management and audit logs.
- Threat-model new public endpoints, payments, identity, file uploads, webhooks and third-party integrations.
- Run secret scanning, dependency review, input validation, authorization checks and OWASP-oriented tests before merge.
- Do not allow agents to approve their own security findings or bypass failed tests.

### Engineering and release

- Follow API-first, modular/domain-driven, event-aware design with observable failure modes.
- Require typecheck, lint, unit tests, integration tests appropriate to the change, and a deployment/rollback plan for production-impacting work.
- Use GitHub PRs and Vercel preview deployments. Production deployment requires a human approval gate.
- Preserve backward compatibility or provide an explicit versioned migration and rollback path.

## Connector authorization gate

Before any agent invokes an external connector, it must verify all of the following:

1. The connector is actually available in the authorized workspace.
2. The user has authenticated it and granted the required scope.
3. The requested operation is necessary and uses the minimum permissions and data.
4. The user has authorized the task, and has explicitly confirmed any external write, send, purchase, payment, create, update, delete, deploy or sharing action.
5. The action target is resolved exactly: repository, branch, environment, file, customer, account, board, document or payment destination.
6. The tool result and resulting external identifier are recorded in the relevant task/PR.

A connector appearing in a registry does **not** mean it is connected, authorized, safe for the data involved, or appropriate to call.

## Approved integration domains

| Domain | Typical use | Control |
|---|---|---|
| GitHub | Source control, issues, PRs, CI status, secret scanning | Feature branches and review gates; no credentials in repository |
| Vercel | Preview deployments, environment configuration, AI gateway | Human approval for production and environment writes |
| Supabase / Neon | Application data and Postgres | Schema migrations, backups and least-privilege service accounts |
| Stripe / Wise | Payments and settlement | Human-approved payment actions; idempotency, reconciliation and audit trails |
| BigCommerce / Shopify | Catalog, storefront and order operations | Scoped store access; test/storefront verification before production changes |
| Google Drive / Microsoft 365 / SharePoint / Notion | Documents and knowledge retrieval | Read-minimization, source citation and explicit sharing approval |
| HubSpot / Pipedrive / Copper | CRM research and workflow support | Confirm customer/account targets before writes or outreach |
| Ahrefs / DataForSEO / Context7 | SEO, market and technical documentation research | Treat outputs as evidence inputs, not final truth |
| Legal/compliance tools | Contract, privacy and policy support | Human legal/compliance review required for conclusions or filings |

## AURION operational domains

- E-commerce: catalog, pricing, checkout, order management, customer support and marketplace integrity.
- Logistics: shipments, route planning, warehouse operations, delivery exceptions, telematics and fulfillment.
- Trade finance: documents, counterparties, settlements, tariff classification and reconciliation.
- Fintech: payment safety, AML/KYC support, fraud signals, credit risk and strict audit trails.
- Corporate operations: strategy, finance, HR, procurement, investor and board workflows.

## Explicit prohibitions

- Do not make autonomous payments, investments, lending, hiring/firing, legal filings, KYC acceptance/rejection, AML disposition, production deployments or destructive data changes.
- Do not use unverified web content as the sole basis for legal, financial, medical, security or regulatory decisions.
- Do not represent a model's output as legal, financial, accounting, tax, investment or regulatory advice.
- Do not install third-party MCP servers, skills, plugins, packages or GitHub Actions without a dependency/security review and human approval.

## Release checklist

- Objective and acceptance criteria met.
- Sources, assumptions, calculations, dates, currencies and units checked.
- Security/privacy/data classification review completed.
- Tests and CI green; dependency and secret scan completed.
- Rollout, monitoring, incident path and rollback documented.
- Required human approval recorded.
