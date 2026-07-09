# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please do **not** open a public GitHub issue.

Instead, report it privately by emailing the maintainer (find contact info in the repository profile).

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

You can expect an acknowledgement within 72 hours and a resolution timeline within 14 days for confirmed issues.

## Scope

This project is a static frontend. The primary attack surfaces are:

- Supabase credentials exposed in `env.js` — never commit real credentials
- Supabase Row Level Security (RLS) policies — ensure your Supabase project has appropriate RLS rules
- Admin authentication — backed by Supabase Auth; do not expose admin routes publicly without auth guards

## Out of Scope

- Vulnerabilities in third-party CDN-hosted libraries (GSAP, Barba.js, Lenis, Supabase JS)
- Issues requiring physical access to the server
