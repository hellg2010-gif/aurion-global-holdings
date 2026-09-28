# ADR-0003 (Accepted) — host + path lock for this repo

**Date:** 2026-09-28  
**Grant:** Build room (Mastermind) ABC strip C — drop `/v0` + Vercel-as-`.com`-host claims.

## Locks

| Item | Rule |
| --- | --- |
| Canonical host | `aurionglobalholdings.com` (owner attaches; Cloudflare target) |
| HUB API prefix | `/hub/v0.1` — **not** `/v0` |
| Contract servers | `https://aurionglobalholdings.com/hub/v0.1` + `http://localhost:3000/hub/v0.1` |
| Forbidden | Vendor preview hosts as OpenAPI servers; marketing claims that production `.com` runs on Vercel |

## In this marketing/MAV repo

- Local Eng stub: `GET /hub/v0.1/health` → `{ status: "ok", phase: "hub-phase1-intermediary" }`
- Governance MAV remains at `/api/governance` (default **OFF**; auth-bound actors — Trust RC1/RC2)
- Root `vercel.json` (if present) is optional Next rewrite/header config for governance — **not** a claim that production `.com` runs on Vercel
- Architecture owns OpenAPI/events under the Architecture workspace contracts (not duplicated as SoR here)

## Not this ABC

- Vercel project teardown = Platform
- Vercel connector disconnect = owner Integrations UI
- Jewelry = separate hold
