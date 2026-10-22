# AURION Global Holdings PLC

Corporate + marketplace platform for AURION Global Holdings PLC — an integrated agro-industrial and commercial group connecting Ethiopian resources, manufacturing, logistics and global markets.

**Canonical host (locked):** [aurionglobalholdings.com](https://aurionglobalholdings.com)  
**Production host:** Cloudflare Workers (ADR-0003)

## Structure

- `/` — Corporate home with ecosystem overview
- `/businesses/*` — Seven independent but interconnected divisions
- `/ecosystem` — Interactive value-chain flowchart + traceability
- `/businesses/global-commerce` — Marketplace (B2C / B2B) with real product photography
- `/investors`, `/sustainability`, `/about`, `/contact`
- `/hub/v0.1/*` — Local Eng HUB API stub (Architecture OpenAPI 0.1)
- `/api/governance` — MAV governance runtime (default **OFF**; auth-bound actors)

## Divisions

1. E-Commerce Export  
2. Jewelry Manufacturing  
3. Agro-Industry  
4. Mining & Minerals  
5. Green Energy  
6. Aviation & Logistics  
7. Global E-Commerce  

## Features

- Interactive ecosystem diagram
- Digital product passports / Trace IDs (design stage)
- Carbon footprint estimates (product level)
- Smart-contract verification (design stage)
- Blockchain anchoring for origin certificates (under investigation)

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- TypeScript
- Production host: Cloudflare Workers with owner-attached DNS (see `docs/adr-0003-host.md`)

## HUB contract stub (ADR-0003)

```bash
# after npm run dev
curl -s http://localhost:3000/hub/v0.1/health
# {"status":"ok","phase":"hub-phase1-intermediary"}
```

OpenAPI servers are `https://aurionglobalholdings.com/hub/v0.1` and localhost only (ADR-0003).

## Local Development

```bash
npm install
npm run dev
```

Node **22** is what CI uses. Optional env: see governance docs in `packages/aurion-governance-mav/UPGRADE.md`. Never commit real API keys.

## Cloudflare deployment

The production build uses OpenNext for Cloudflare Workers:

```bash
npm run cf:build
npm run cf:preview
npm run cf:deploy
```

Authenticate Wrangler with the Cloudflare account that owns the production zone before previewing or deploying. Attach `aurionglobalholdings.com` to the Worker in that account and configure production secrets there; repository changes cannot transfer DNS, account ownership, or revoke external integrations. The governance API remains disabled by default; do not enable it in Workers until its file-backed store is replaced with durable Cloudflare storage.

## Contact

info-ecosys@aurionglobalholdings.com
