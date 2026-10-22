# ADR-0003 (Accepted) — host + path lock for this repo

**Date:** 2026-09-28  
**Grant:** Build room (Mastermind) ABC strip C — lock the production host and HUB API prefix.

## Locks

| Item | Rule |
| --- | --- |
| Canonical host | `aurionglobalholdings.com` on Cloudflare Workers |
| HUB API prefix | `/hub/v0.1` |
| Contract servers | `https://aurionglobalholdings.com/hub/v0.1` + `http://localhost:3000/hub/v0.1` |
| Forbidden | Vendor preview hosts as OpenAPI servers |

## In this marketing/MAV repo

- Local Eng stub: `GET /hub/v0.1/health` → `{ status: "ok", phase: "hub-phase1-intermediary" }`
- Governance MAV remains at `/api/governance` (default **OFF**; auth-bound actors — Trust RC1/RC2)
- OpenNext and Wrangler build and deploy the Next.js application as a Cloudflare Worker.
- Governance remains disabled by default; the file-backed store is not suitable for Workers persistence.
- Architecture owns OpenAPI/events under the Architecture workspace contracts (not duplicated as SoR here)

## Account ownership

- Cloudflare zone ownership, DNS attachment, secrets and third-party account disconnects require the account owner.
- Jewelry = separate hold
