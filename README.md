# AURION Global Holdings PLC

Corporate + marketplace platform for AURION Global Holdings PLC — an integrated agro-industrial and commercial group connecting Ethiopian resources, manufacturing, logistics and global markets.

**Live domain target:** [aurionglobal.online](https://aurionglobal.online)

## Structure

- `/` — Corporate home with ecosystem overview
- `/businesses/*` — Seven independent but interconnected divisions
- `/ecosystem` — Interactive value-chain flowchart + traceability
- `/businesses/global-commerce` — Marketplace (B2C / B2B) with real product photography
- `/investors`, `/sustainability`, `/about`, `/contact`

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
- Digital product passports / Trace IDs
- Carbon footprint estimates (product level)
- Smart-contract verification (design stage)
- Blockchain anchoring for origin certificates (under investigation)

## Tech Stack

- Next.js 15/16 (App Router)
- Tailwind CSS 4
- TypeScript
- Deployed on Vercel

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

See `.env.example` for placeholders only. Never commit real keys.

## Admin authentication and console setup

1. Create a Supabase project and enable Email/password authentication in Supabase Auth.
2. Apply `supabase/migrations/20260906135500_admin_console.sql`.
3. Create the initial admin user manually in Supabase Auth.
4. In SQL Editor, assign the admin role for that user:
   ```sql
   update public.profiles
   set role = 'admin', updated_at = timezone('utc', now())
   where id = '<auth_user_uuid>';
   ```
5. Sign in at `/admin/login`, then manage config records at `/admin`.

## Security and threat-model notes

- Admin routes and admin mutation APIs require a valid authenticated session plus `profiles.role = 'admin'` server-side.
- The app does not ship default credentials and does not store any admin email/password in source code.
- Password reset uses Supabase recovery links and updates password only after recovery verification (or fresh current-password verification).
- UI error messages are generic for sign-in/reset to reduce account-enumeration behavior.
- Admin configuration entries are structured metadata only (`name`, `category`, `description`, `enabled`, `risk`, `approval`) and are not executed as code, commands, plugin binaries, MCP servers, or arbitrary URLs.
- If you later introduce server-only Supabase service-role flows, keep the service-role key in server secrets only and never expose it to browser code.

## Contact

wondmeneh@aurionglobal.store
