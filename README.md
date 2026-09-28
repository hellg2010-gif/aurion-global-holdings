# AURION Global Holdings PLC

Corporate + marketplace platform for AURION Global Holdings PLC — an integrated agro-industrial and commercial group connecting Ethiopian resources, manufacturing, logistics and global markets.

**Canonical host (locked):** [aurionglobalholdings.com](https://aurionglobalholdings.com)  
**Host target:** Cloudflare / host-agnostic (ADR-0003 Accepted — **not** Vercel as the `.com` host)

## Structure

- `/` — Corporate home with ecosystem overview
- `/businesses/*` — Seven independent but interconnected divisions
- `/ecosystem` — Interactive value-chain flowchart + traceability
- `/businesses/global-commerce` — Marketplace (B2C / B2B) with real product photography
- `/investors`, `/sustainability`, `/about`, `/contact`
- `/hub/v0.1/*` — Local Eng HUB API stub (Architecture OpenAPI 0.1; **not** `/v0`)
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

- Next.js 15/16 (App Router)
- Tailwind CSS 4
- TypeScript
- Production `.com` host: Cloudflare / owner-attached DNS (see `docs/adr-0003-host.md`)

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

## Contact

info-ecosys@aurionglobalholdings.com
