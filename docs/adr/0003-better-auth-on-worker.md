# Better Auth, self-hosted on the Worker

Authentication is **Better Auth** (MIT, open source) running inside the Worker with Google OAuth as the only provider in v1, sessions stored in D1 (Better Auth's native D1 support, `database: env.DB`). Email/password login is a later flag.

Supabase Auth left with Supabase. Alternatives: Clerk (hosted, faster to integrate, but user data lives on Clerk's infra and it's a vendor we didn't need) and Auth.js (more churn, less first-class D1 support than Better Auth's native dialect). Self-hosting keeps every byte of user data in our own D1 database and costs nothing.

Consequences: Better Auth owns the `user`, `session`, `account`, and `verification` tables — the `profiles` table from the original Supabase plan is dropped (Better Auth's `user` row already holds name, email, avatar). Authorization is app-level in the Worker (every query scoped by session `userId`), since D1 has no Row Level Security. Route protection uses Next.js middleware; bookmark mutations additionally check the session server-side.
