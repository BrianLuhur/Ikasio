# Ikasio — Technical Plan

---

## 1. Three-Week Build Plan

### Rules for this plan
- Each day assumes 4–6 focused hours of work
- Days are sequential, not calendar days — if you lose a day to work or life, the plan slides, not the scope
- At the end of each day, report back to the manager chat with what's done and what's blocked
- Nothing from Week 2 gets touched until Week 1 is complete
- Nothing from Week 3 gets touched until Week 2 is complete

---

### Week 1 — Foundation

**Day 1 — Project Setup**
- Initialise Next.js project with TypeScript
- Configure Tailwind CSS v4
- Set up ESLint and Prettier
- Establish folder structure (see Section 3)
- Initialise Git repository and push to GitHub
- Set up environment variables file (.env)

**Day 2 — Database Setup**
- Create PostgreSQL database on Supabase or Railway
- Install and configure Prisma ORM
- Write full Prisma schema (see Section 2)
- Run first migration
- Verify database connection

**Day 3 — Authentication**
- Install and configure NextAuth.js
- Set up Google OAuth provider (simplest for MVP)
- Build sign in / sign out pages
- Protect routes — unauthenticated users redirect to sign in
- Verify session works across page refreshes

**Day 4 — Subject Organisation**
- Build sidebar component listing all subjects
- API routes: create, read, update, delete subjects
- Subject creation modal or inline form
- Click subject → navigate to subject view
- Empty state when no subjects exist

**Day 5 — Lecture Creation**
- Within a subject view, build lecture list
- Lecture creation: title + paste raw content (textarea)
- API routes: create, read, delete lectures
- Save raw content to database
- Display list of lectures within a subject

**Day 6 — Note Editor**
- Install and configure TipTap editor
- Basic toolbar: headings, bullet points, bold, italic
- API routes: create, update, read notes
- Notes belong to a lecture — display note editor when lecture is selected
- Auto-save note content on change (debounced)

**Day 7 — AI Note Generation**
- Connect Claude API
- When lecture is created: send raw content to Claude API with structured prompt
- Claude returns formatted, structured notes
- Notes are automatically saved to database — no manual copy-paste
- Display generated notes in TipTap editor (user can edit further)

**Week 1 complete when:** User can sign in, create a subject, paste a lecture, and have AI-generated notes saved automatically.

---

### Week 2 — The AI Layer

**Day 8 — AI Chat Panel UI**
- Build chat panel component within subject view
- Message input, send button, message history display
- UI only — no API connection yet
- Responsive layout: notes on left, chat on right

**Day 9 — Claude API Integration for Chat**
- Connect chat panel to Claude API
- Send user message + receive assistant response
- Display response in chat panel
- Basic error handling

**Day 10 — Note Context in Chat**
- Before sending chat message to Claude API, aggregate all notes from all lectures in the current subject
- Include aggregated notes as system context in every API call
- Claude now answers questions with awareness of all saved notes
- Test: ask cross-lecture question, verify Claude uses saved note context

**Day 11 — Persistent Chat History**
- Save every chat message to database (ChatMessage model)
- On chat panel load, retrieve full message history from database
- Send full history with every new API call (full context window)
- Chat now persists across sessions — reopening the subject resumes the conversation

**Day 12 — Unified Notes View**
- Build a unified view within each subject showing all lectures and their notes
- Collapsible lecture sections
- All notes visible in one scrollable view without switching between lectures
- This is the revision view — everything in one place

**Day 13 — Note Search**
- Basic text search across all notes within a subject
- Highlight matching terms
- Filter view to show only matching notes

**Day 14 — Week 2 Polish**
- Fix bugs from Days 8–13
- Improve loading states and error handling
- Improve chat UX (scroll to bottom on new message, loading indicator while Claude responds)
- Code review and cleanup

**Week 2 complete when:** User can chat with AI that has full context of all saved notes across all lectures in a subject, and that chat persists across sessions.

---

### Week 3 — Progress & Motivation

**Day 15 — Pomodoro Timer**
- Build Pomodoro timer component
- 25 minutes work / 5 minutes break cycles
- Visual countdown display
- Start, pause, reset controls
- Browser tab title updates with remaining time
- Notification when session ends (browser notification API)

**Day 16 — Session Logging**
- When a Pomodoro session completes, log it to database (StudySession model)
- Associate session with current subject
- Display total time studied per subject in sidebar
- Display session history within subject view

**Day 17 — Practice Question Generation**
- Build "Generate Practice Questions" button within subject view
- Send all saved notes to Claude API with prompt to generate 5–10 questions and answers
- Save questions to database (PracticeQuestion model)
- Display questions in a dedicated practice view

**Day 18 — Practice Question UI**
- Show question, hide answer
- User reveals answer, marks themselves correct or incorrect
- Track attempts and results in database
- Score summary at end of question set

**Day 19 — Progress Visualisation**
- Display per subject: total time studied, lectures covered, questions attempted, questions correct
- Simple visual — progress bars or a tree that grows
- Dashboard view showing all subjects and their progress at a glance

**Day 20 — Deployment**
- Deploy Next.js app to Vercel
- Connect production database (Supabase or Railway)
- Set all environment variables in Vercel dashboard
- Run migrations on production database
- Verify everything works end to end on live URL

**Day 21 — Final Polish**
- Fix any deployment bugs
- Write README for GitHub repository
- Record a short demo walkthrough
- Update portfolio with Ikasio project entry

**Week 3 complete when:** App is live at a public URL, fully functional end to end.

---

## 2. Database Schema (Prisma)

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// AUTH MODELS (required by NextAuth.js)
// ============================================================

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  subjects      Subject[]
  studySessions StudySession[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================================
// CORE APP MODELS
// ============================================================

model Subject {
  id          String   @id @default(cuid())
  name        String
  description String?
  colour      String?  // Optional hex colour for visual distinction in sidebar
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  lectures          Lecture[]
  chatMessages      ChatMessage[]
  studySessions     StudySession[]
  practiceQuestions PracticeQuestion[]
}

model Lecture {
  id         String   @id @default(cuid())
  title      String
  rawContent String   @db.Text // The pasted lecture content from the user
  order      Int      @default(0) // Week 1, Week 2, etc — for display ordering
  subjectId  String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  notes   Note[]
}

model Note {
  id            String   @id @default(cuid())
  title         String?
  content       String   @db.Text // TipTap JSON content
  isAiGenerated Boolean  @default(false) // true = generated by Claude, false = written by user
  lectureId     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  lecture Lecture @relation(fields: [lectureId], references: [id], onDelete: Cascade)
}

model ChatMessage {
  id        String   @id @default(cuid())
  role      String   // "user" or "assistant"
  content   String   @db.Text
  subjectId String
  createdAt DateTime @default(now())

  // Relations
  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)
}

model StudySession {
  id        String   @id @default(cuid())
  duration  Int      // Duration in minutes (always 25 for a completed Pomodoro)
  subjectId String
  userId    String
  createdAt DateTime @default(now())

  // Relations
  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PracticeQuestion {
  id        String   @id @default(cuid())
  question  String   @db.Text
  answer    String   @db.Text
  attempted Boolean  @default(false)
  correct   Boolean? // null = not yet attempted
  subjectId String
  createdAt DateTime @default(now())

  // Relations
  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)
}
```

---

## 3. Folder Structure

```
ikasio/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← Sidebar lives here
│   │   └── subjects/
│   │       ├── page.tsx        ← All subjects view
│   │       └── [subjectId]/
│   │           ├── page.tsx    ← Subject view (notes + chat)
│   │           └── lectures/
│   │               └── [lectureId]/
│   │                   └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── subjects/
│   │   │   └── route.ts
│   │   ├── lectures/
│   │   │   └── route.ts
│   │   ├── notes/
│   │   │   └── route.ts
│   │   ├── chat/
│   │   │   └── route.ts
│   │   ├── study-sessions/
│   │   │   └── route.ts
│   │   └── practice-questions/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx                ← Landing / redirect to dashboard
├── components/
│   ├── sidebar/
│   ├── note-editor/
│   ├── chat-panel/
│   ├── pomodoro-timer/
│   ├── practice-questions/
│   └── ui/                     ← Reusable primitives (button, modal, etc)
├── lib/
│   ├── prisma.ts               ← Prisma client singleton
│   ├── auth.ts                 ← NextAuth config
│   └── claude.ts               ← Claude API helper functions
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
└── package.json
```

---

## 4. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (for NextAuth)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Claude API
ANTHROPIC_API_KEY=""
```

---

## 5. Progress Tracker

Updated in the manager chat at the end of each day.

### Week 1 — Foundation
- [ ] Day 1 — Project setup
- [ ] Day 2 — Database setup
- [ ] Day 3 — Authentication
- [ ] Day 4 — Subject organisation
- [ ] Day 5 — Lecture creation
- [ ] Day 6 — Note editor (TipTap)
- [ ] Day 7 — AI note generation

### Week 2 — The AI Layer
- [ ] Day 8 — AI chat panel UI
- [ ] Day 9 — Claude API integration for chat
- [ ] Day 10 — Note context in chat
- [ ] Day 11 — Persistent chat history
- [ ] Day 12 — Unified notes view
- [ ] Day 13 — Note search
- [ ] Day 14 — Week 2 polish

### Week 3 — Progress & Motivation
- [ ] Day 15 — Pomodoro timer
- [ ] Day 16 — Session logging
- [ ] Day 17 — Practice question generation
- [ ] Day 18 — Practice question UI
- [ ] Day 19 — Progress visualisation
- [ ] Day 20 — Deployment
- [ ] Day 21 — Final polish and README
```
