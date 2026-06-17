# AGENTS.md — Ikasio

Coding agent guidance for Ikasio. Read this before writing any code.

---

## What This Project Is

Ikasio is an AI-powered study workspace for university students. Students paste lecture content, the AI generates structured notes that are automatically saved, and an AI chat panel reads all saved notes across all lectures in a subject as context. The core differentiator: the AI reads the student's enriched understanding, not just raw source material.

---

## Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 15.x |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | v4 (CSS-first) |
| Auth | NextAuth.js | v5 |
| Database ORM | Prisma | Latest |
| Database | PostgreSQL | — |
| Note editor | TipTap | Latest |
| AI | Claude API | claude-sonnet-4-6 |
| Deployment | Vercel + Supabase/Railway | — |

---

## Critical: Tailwind CSS v4

This project uses Tailwind v4, which is fundamentally different from v3.

**Do NOT:**
- Create or reference `tailwind.config.js` or `tailwind.config.ts` — these do not exist in v4
- Use `@tailwind base`, `@tailwind components`, `@tailwind utilities` directives
- Install `autoprefixer` — not needed in v4

**Do:**
- Use `@import "tailwindcss"` at the top of `app/globals.css` — already set up
- Use `@theme` blocks in CSS for custom design tokens
- Reference `postcss.config.mjs` which uses `@tailwindcss/postcss`

---

## Critical: Next.js 15 App Router

This project uses the App Router only. No Pages Router.

**Do NOT:**
- Create files inside `pages/` — this directory does not exist
- Use `getServerSideProps`, `getStaticProps`, or `getInitialProps`
- Use `next/router` — use `next/navigation` instead

**Do:**
- Use `app/` directory for all routes
- Use Server Components by default; add `'use client'` only when needed
- Use `useRouter` from `next/navigation`, not `next/router`
- Route groups use parentheses: `(auth)`, `(dashboard)`
- Dynamic segments use brackets: `[subjectId]`, `[lectureId]`, `[...nextauth]`

---

## TypeScript Rules

- Strict mode is enabled — no `any` types
- All function parameters and return types must be explicitly typed
- Use `interface` for object shapes, `type` for unions and primitives
- All API route handlers must type their request and response

---

## Folder Structure
ikasio/

├── app/

│   ├── (auth)/

│   │   ├── sign-in/page.tsx

│   │   └── layout.tsx

│   ├── (dashboard)/

│   │   ├── layout.tsx

│   │   └── subjects/

│   │       ├── page.tsx

│   │       └── [subjectId]/

│   │           ├── page.tsx

│   │           └── lectures/[lectureId]/page.tsx

│   ├── api/

│   │   ├── auth/[...nextauth]/route.ts

│   │   ├── subjects/route.ts

│   │   ├── lectures/route.ts

│   │   ├── notes/route.ts

│   │   ├── chat/route.ts

│   │   ├── study-sessions/route.ts

│   │   └── practice-questions/route.ts

│   ├── layout.tsx

│   └── page.tsx

├── components/

│   ├── sidebar/

│   ├── note-editor/

│   ├── chat-panel/

│   ├── pomodoro-timer/

│   ├── practice-questions/

│   └── ui/

├── lib/

│   ├── prisma.ts       ← Prisma client singleton — always import from here

│   ├── auth.ts         ← NextAuth config

│   └── claude.ts       ← Claude API helpers

├── prisma/

│   └── schema.prisma

└── docs/               ← Project documentation
---

## Key Patterns

### Prisma client
Always import from `lib/prisma.ts`. Never instantiate `new PrismaClient()` inline anywhere else.

```typescript
import { prisma } from '@/lib/prisma';
```

### Claude API
Always use model string `claude-sonnet-4-6`. Never use `claude-3-*`, `claude-opus-*`, or any other string.

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [...],
});
```

### Server Components vs Client Components
Default to Server Components. Only add `'use client'` when the component uses:
- React hooks (`useState`, `useEffect`, etc.)
- Browser APIs
- Event listeners

### API routes
All API routes live in `app/api/`. Use named exports `GET`, `POST`, `PUT`, `DELETE`:

```typescript
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }
```

### Import alias
Use `@/` for all internal imports:

```typescript
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/sidebar/Sidebar';
```

---

## What NOT to Do

- Do not create `tailwind.config.js` or `tailwind.config.ts`
- Do not use the Pages Router (`pages/` directory)
- Do not use `any` TypeScript type
- Do not instantiate `PrismaClient` outside of `lib/prisma.ts`
- Do not use model strings other than `claude-sonnet-4-6`
- Do not use Turbopack (`next dev --turbo`)
- Do not use `next/router` — use `next/navigation`
- Do not commit `.env` — only `.env.example` is committed

---

## Environment Variables

Required variables (see `.env.example`):
DATABASE_URL          PostgreSQL connection string

NEXTAUTH_SECRET       Random secret for NextAuth session signing

NEXTAUTH_URL          App URL (http://localhost:3000 in dev)

GOOGLE_CLIENT_ID      Google OAuth client ID

GOOGLE_CLIENT_SECRET  Google OAuth client secret

ANTHROPIC_API_KEY     Claude API key

---

## Dev Environment

- OS: WSL2, Ubuntu 24.04
- Node: 24.15.0 (pinned in `.nvmrc`)
- Package manager: npm
- Project path: `/home/brian/projects/ikasio`
- GitHub: `git@github.com:BrianLuhur/Ikasio.git`