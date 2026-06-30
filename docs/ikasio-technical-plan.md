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

## Day 1 Learnings — Permanent Notes for All Future Days

These were discovered during Day 1 and apply to every subsequent day.

**1. NEVER run `npm audit fix --force`**
This command ignores breaking changes and downgraded Next.js from 15 to 9.3.3 during Day 1. It was resolved by reinstalling `next@15`, `react@19`, and `react-dom@19`. Every technical prompt must include an explicit warning against this command.

**2. Tailwind CSS v4 installs automatically with create-next-app**
The latest `create-next-app` template installs Tailwind v4 automatically. The manual installation step originally planned for Day 1 was not needed. No future day needs to touch Tailwind setup.

**3. GitHub remote uses a capital I**
The correct remote URL is `git@github.com:BrianLuhur/Ikasio.git`. Every future prompt referencing the remote must use this exact casing.

**4. NEXTAUTH_SECRET is already generated**
The secret was generated with `openssl rand -base64 32` and stored in `.env` during Day 1. Day 3 only needs Google OAuth credentials added — do not regenerate the secret.

**5. All API route stubs have `export {}`**
TypeScript-safe placeholders are in place. No changes needed to existing stubs until their implementation day.

**6. Windows Zone.Identifier files**
A `.gitignore` rule was added during Day 1 to prevent Windows metadata files from being committed. This is already handled.

---

## Day 2 Learnings — Permanent Notes for All Future Days

These were discovered during Day 2 and apply to every subsequent day.

**1. NEVER upgrade Prisma to v7**
Prisma 7 removed `url` and `directUrl` from `schema.prisma`, breaking the entire datasource block approach the technical plan uses. Prisma 7 requires `prisma.config.ts` and `@prisma/adapter-pg` — significant undocumented complexity with an unstable API. Prisma was downgraded to v6.19.3 on Day 2 and must stay there. Every future day that installs or references Prisma must pin to v6: `npm install prisma@6 --save-dev` and `npm install @prisma/client@6`.

**2. Prisma Studio is incompatible with Node.js v24**
Prisma Studio crashes on launch with Node.js v24 — this is a known upstream bug. Use the **Supabase Table Editor** for all visual database inspection instead. Any future day that involves schema changes or database debugging should reference the Supabase Table Editor, not Prisma Studio.

**3. DATABASE_URL uses port 6543, DIRECT_URL uses port 5432**
Both connection strings are set in `.env`. The transaction pooler (6543) is used for runtime queries. The direct connection (5432) is used for migrations only via `directUrl` in `schema.prisma`. Do not mix these up.

**4. NEXTAUTH_SECRET is already generated**
Set in `.env` during Day 1. Day 3 only needs Google OAuth credentials added — do not regenerate the secret.

---

## Day 3 Learnings — Permanent Notes for All Future Days

These were discovered during Day 3 and apply to every subsequent day.

**1. JWT session strategy is required — database sessions are not possible with Edge middleware**
NextAuth v5 middleware runs in Edge Runtime. Edge Runtime cannot use PrismaAdapter. Database session strategy requires the adapter to verify sessions on every request. Therefore JWT session strategy must be used. This means:
- Sessions are stored as signed JWT cookies — no database call in middleware
- PrismaAdapter still creates User and Account rows in Supabase on every OAuth sign-in
- The Session table in the database will remain EMPTY — JWT does not write to it
- The VerificationToken table is also unused — email provider is not in scope
- This is the standard NextAuth v5 + PrismaAdapter + Edge middleware pattern

**2. session.user.id is available in any Server Component**
TypeScript module augmentation was added in lib/auth.ts. Access via:
```typescript
const session = await auth()
session?.user?.id  // typed correctly, no TypeScript error
```

**3. Import rules for auth**
- Import auth-related functions from `@/lib/auth` — not from `next-auth` directly
- Do NOT import from `@/auth.config` in any page or component
- `auth.config.ts` is for middleware only — it is edge-safe and has no PrismaAdapter

**4. next-auth version is 5.0.0-beta.31**
Installed version is `next-auth@5.0.0-beta.31`. Do not upgrade without testing — beta versions can introduce breaking changes.

**5. Sign-in uses a Server Action, not a client-side handler**
The sign-in button on `app/(auth)/sign-in/page.tsx` is a Server Component with a `<form>` whose `action` is an async Server Action calling `signIn("google", { redirectTo: "/subjects" })` from `@/lib/auth`. No `"use client"` directive, no `onClick` handler, no `next-auth/react`. Any future page that needs a sign-in or sign-out trigger should follow this same Server Action pattern for consistency, rather than introducing a client-side `signIn` call from `next-auth/react`.

**6. CRITICAL — auth.config.ts requires an explicit `authorized` callback or middleware does not enforce redirects**
This was missed in the original Day 3 implementation and discovered as a security gap during Day 4 testing: direct navigation to a protected route in a fully unauthenticated browser loaded the page instead of redirecting to `/sign-in`. In NextAuth v5, wrapping `auth()` as middleware only attaches session data to the request — it does NOT enforce a redirect without an explicit `callbacks.authorized` function. Without it, every request is implicitly treated as authorized regardless of session state. `auth.config.ts` must include:
```typescript
callbacks: {
  authorized({ auth }) {
    return !!auth?.user
  }
}
```
This is a hard requirement for middleware-based route protection to function at all, not an optional enhancement. If this callback is ever removed, route protection silently stops working with no error.

**7. CRITICAL — spread order in lib/auth.ts must be preserved**
Adding the `authorized` callback to `auth.config.ts` caused a regression: `session.user.id` became `undefined` for newly signed-in users, breaking every API route's ownership check. Root cause: in `lib/auth.ts`, `...authConfig` was spread AFTER the inline `callbacks` block inside `NextAuth({...})`. Once `authConfig` gained its own `callbacks` key, the spread silently overwrote the inline `jwt` and `session` callbacks — object spread replaces duplicate keys, it does not merge them. The fix, which must be preserved in all future edits to `lib/auth.ts`:
- `...authConfig` must be spread BEFORE the inline `callbacks` key
- Inside that `callbacks` block, explicitly merge `...authConfig.callbacks` alongside the inline `jwt` and `session` callbacks, so all three (`authorized`, `jwt`, `session`) coexist
- Reversing this order will silently break `session.user.id` again with no obvious error — verify via `fetch('/api/auth/session')` showing a populated `user.id` if anything in this file is touched again

**8. JWT session cookies do not invalidate when database rows are deleted**
Because JWT strategy means middleware validates the signed cookie only and never re-checks the database, a user deleted from Supabase can still hold a "valid" session. When testing auth flows that involve deleting test users, manually clear `authjs.session-token`, `authjs.callback-url`, and `authjs.csrf-token` cookies, or use a fresh incognito window — do not assume deleting the database row resets the session.

---

## Day 4 Learnings — Permanent Notes for All Future Days

These were discovered during Day 4 and apply to every subsequent day.

**1. Shared list state belongs in a Context provider, not independent fetches per component**
Day 4 originally specified the sidebar and the subjects page each fetching subjects independently. This caused a real bug: creating a subject from one location did not update the other. The fix was `SubjectsProvider` (`components/sidebar/subjects-provider.tsx`), a React Context at the dashboard layout level exposing `subjects`, `isLoading`, `addSubject`, and `refetch`. Any future component that needs the subject list — for example a lecture creation flow that needs to know the current subject — should consume `useSubjects()` rather than fetching independently. This pattern should be followed for any other data that multiple sibling components need simultaneously (e.g. notes list in Day 6+).

**2. `react-hooks/set-state-in-effect` is an active ESLint rule in this project**
This rule flags calling a state setter synchronously inside `useEffect` (e.g. `setIsLoading(true)` at the top of a `fetchData()` call triggered on mount) — part of the React Compiler-readiness rule set shipped with the current Next.js/ESLint config. It will very likely surface again on Day 5 (lecture fetching), Day 6 (note fetching), and Day 10 (chat history fetching). For Day 4 it was suppressed with an inline `eslint-disable-next-line` and an explanatory comment rather than introducing SWR or React Query, which was judged out of scope. If this rule fires repeatedly across future days, consider whether adopting a data-fetching library is worth it for the whole project rather than suppressing it day after day — flag this as a decision point if it recurs more than twice more.

**3. Next.js 15 Server Components use async params**
Dynamic route params are `Promise<{ subjectId: string }>`, not a plain object — they must be awaited: `const { subjectId } = await params`. This pattern was established in `app/(dashboard)/subjects/[subjectId]/page.tsx` and must be followed identically in Day 5's `app/(dashboard)/subjects/[subjectId]/lectures/[lectureId]/page.tsx` and any other dynamic Server Component route.

**4. Known tech debt — duplicated Subject type**
The `Subject` TypeScript type is independently defined in `subjects-provider.tsx` (exported, canonical) and `create-subject-modal.tsx` (local, unsynced duplicate). Not urgent, but should be consolidated — likely via `import type { Subject } from '@prisma/client'` directly — before more components need this shape. Revisit during Day 14 (Week 2 polish) if not addressed sooner.

**5. Delete-subject UI and sign-out UI were missed from their original days, completed in a catch-up session**
The Subjects API route supports `DELETE` and correctly verifies ownership, but Day 4's original detailed prompt never specified a UI trigger for it — the document's high-level spec only said "API routes: ...delete subjects" without an equivalent UI requirement, unlike create which explicitly got "Subject creation modal." This has been corrected in the Day 4 spec above. Separately, sign-out was always correctly scoped to Day 3 in the high-level plan ("Build sign in / sign out pages") but was dropped when the detailed Day 3 prompt was written — only sign-in was implemented. Both gaps were closed in a dedicated catch-up session run before Day 5 began. See the catch-up session summary for what was actually built and where the sign-out trigger and delete-subject trigger live in the codebase.

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
- Create PostgreSQL database on Supabase
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
- Delete subject UI — confirmation required before deleting, since this cascades and deletes all lectures, notes, chat messages, study sessions, and practice questions for that subject
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
- Note generation lives at `/api/notes/generate/route.ts` — this is a distinct endpoint separate from the CRUD notes API at `/api/notes/route.ts` and the Q&A chat at `/api/chat/route.ts`. Create this file on Day 7.
- When generating notes for a lecture, the API call must include three things in context:
  1. The raw lecture content (`Lecture.rawContent`) — the actual source material
  2. Any notes already generated for this lecture — so topic-by-topic generation stays consistent in style, depth, and format. These notes are retrieved from the database as TipTap JSON and must be converted to plain text using `generateText()` from `@tiptap/core` before being sent to Claude, same as Day 10.
  3. The chat history of the current session — so the AI knows what has been covered
- Topic-by-topic flow: when the user says "generate paging notes", the API receives raw content + (no notes yet) + message. When the user then says "proceed to free space management", the API receives raw content + paging notes + message — so the AI generates the next topic from the actual source material while staying consistent with notes already produced
- Claude returns formatted, structured notes
- Notes are automatically saved to database — no manual copy-paste
- When saving a newly generated note, explicitly initialize both evolution fields: set `updateCount: 1` and `updateHistory: ["Generated"]`. Do NOT rely on schema defaults here — the schema defaults `updateCount` to `0` and `updateHistory` to `[]`, but a freshly generated note has already been through one creation step and must reflect that immediately.
- Set `isAiGenerated: true` when saving a Claude-generated note. The schema default is `false` — if this field is not explicitly set, every AI-generated note will be stored identically to a user-written note, silently corrupting the distinction the field exists to track.
- Display generated notes in TipTap editor (user can edit further)
- Key principle: `Lecture.rawContent` is the source the AI draws from during generation. Saved notes are what the AI draws from during later questioning (Day 10). These are two distinct context strategies for two distinct phases.

**TipTap JSON conversion — required implementation step:**
Claude returns notes as markdown text. `Note.content` is stored as TipTap JSON. These are not the same format — saving raw markdown directly into TipTap will not render correctly.

Important: `generateJSON` from `@tiptap/core` expects **HTML**, not markdown. Passing Claude's raw markdown into it will silently produce malformed content. The correct pipeline is: markdown → HTML → TipTap JSON.

Use the `marked` library to convert markdown to HTML first:

```typescript
import { marked } from 'marked'
import { generateJSON } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

// Step 1: Claude returns markdown
// Step 2: convert markdown to HTML
const html = await marked(markdownOutput)
// Step 3: convert HTML to TipTap JSON object
const tiptapJSON = generateJSON(html, [StarterKit])
// Step 4: stringify before saving — Prisma stores Note.content as String,
// but generateJSON returns a JSONContent object, not a string
await prisma.note.create({ data: { content: JSON.stringify(tiptapJSON) } })
```

Install `marked` before Day 7: `npm install marked`

This conversion must happen on Day 7 for note generation, and again on Day 12 for the merged note from Update Note from Chat. Missing this step will cause the note editor to display raw markdown strings instead of rendered content.

**Day 7 trigger UI — important sequencing note:**
The chat panel does not exist until Day 8. For Day 7, build a minimal temporary trigger inside the lecture view — a simple textarea and "Generate Notes" button. This is not the final UI. It exists only to test the backend pipeline end to end. Day 8 replaces this temporary trigger with the proper chat-based generation flow. Do not invest time making the Day 7 trigger look polished.

**Week 1 complete when:** User can sign in, create a subject, paste a lecture, and have AI-generated notes saved automatically — generated topic by topic from the actual source material.

---

### Week 2 — The AI Layer

**Day 8 — AI Chat Panel UI**
- Build chat panel component within subject view
- Responsive layout: notes panel on left, chat panel on right
- Message input, send button, message history display

Critical architecture decisions to implement on this day:

**1. Two types of chat interactions — handled differently**

The chat panel handles two fundamentally different types of user messages. These must be distinguished in the UI and handled differently:

- **Generation requests** ("generate paging notes", "proceed to free space management") — these trigger note creation. The output is saved to the notes panel, not displayed as a chat message. The chat panel shows only a brief confirmation: "Paging notes generated and saved — see notes panel." The full note content never lives in the chat.

- **Q&A questions** ("how does paging connect to virtual memory?", "give me an analogy") — these are standard chat interactions. The response stays in the chat panel as a persistent message, saved to the `ChatMessage` table.

**Do NOT infer intent from message content.** "Tell me more about paging" is ambiguous — it could be a generation request or a Q&A question. Inferring from text is unreliable. The solution is a **dedicated Generate button** separate from the Q&A input:

```
[Chat input: "Ask anything about your notes..."] [Send]
[Generate Notes ▼] ← dedicated button, separate from Q&A input
```

The Generate button opens a generation-specific input or sends a structured generation request. The Q&A input is for questions only. This removes all ambiguity about which type of message is being sent.

**Cross-day wiring — required on Day 8:** When connecting the Generate button to the Day 7 backend (`/api/notes/generate`), update the generation API call to pass the current chat history as the third context item, per Phase 1 in Section 1.5. The Day 7 temporary trigger had no chat history — now that the chat panel exists, the generation endpoint must receive it. A developer who wires the Generate button without updating this call will produce notes that ignore chat context already established in the session.

**2. Lecture filter on chat panel**

Since the centralized subject chat contains Q&A from all lectures mixed chronologically, the user needs a way to filter by lecture. This is a critical UX requirement — without it, a student revising Lecture 3 has to scroll through the entire chat history to find relevant Q&A.

Build a filter dropdown at the top of the chat panel:
```
[Filter: All lectures ▼]
[Filter: Lecture 3 — Memory Management]
[Filter: Lecture 5 — File Systems]
```

This is powered by `ChatMessage.metadata.lectureId` — every message must store which lecture was active when it was sent (implemented fully in Day 11, but the UI for the filter is built here).

**3. Revision lives in the notes panel, not the chat**

The chat is for conversation. The notes panel is for revision. These are separate concerns. The UI should make this clear — the notes panel should be immediately navigable by lecture without requiring any chat interaction.

**4. Cross-subject context picker (Option B — MVP)**

By default, the AI reads notes from the current subject only. When a student needs cross-subject context, a multi-select subject picker at the top of the chat panel lets them explicitly add other subjects:

```
Context: [Operating Systems ✓] [+ Add subject ▼]
                    ↓ user adds Computer Networks
Context: [Operating Systems ✓] [Computer Networks ✓] [+ Add ▼]
```

Implementation details:
- Default state: current subject only
- Subject picker lists all subjects the user has created
- Selection is local UI state — no database changes needed, resets per session
- When the user sends a message, Day 10's context aggregation reads notes from all selected subjects, not just the current one
- This is the feature that enables cross-subject AI context — Ikasio's architecturally unique differentiator

**Option C (post-MVP upgrade path):** A separate global chat at the dashboard level with access to all subjects simultaneously, replacing the per-subject chat for cross-subject queries. The underlying query and API call are identical — only the routing and UI change. No schema migration required when upgrading from Option B to Option C.

**Day 9 — Claude API Integration for Chat**
- Connect chat panel to Claude API
- Send user message + receive assistant response
- Display response in chat panel
- Basic error handling

**Implement streaming.** Without streaming, the user sends a message and stares at a blank space for 5-10 seconds until the full Claude response arrives. With streaming, tokens appear as Claude generates them — the response feels immediate and alive.

Implementation approach:
- Use the Anthropic SDK's streaming method (`stream()`)
- Return a streaming response from the Next.js API route using `ReadableStream` or Server-Sent Events
- On the client, incrementally update the message as tokens arrive
- Show a loading indicator until the first token appears

Streaming is a significant UX improvement and should be implemented from Day 9, not retrofitted later.

**Stream failure handling:**
If the Claude API stream fails mid-response, discard the partial content entirely — do not save it to the database or display it as a complete message. Show an error state: "Something went wrong. Please try again." This applies to both Q&A responses (chat panel) and note generation (Day 7 backend). A partially generated note or a truncated answer is worse than no response — it can corrupt note content or give the user incomplete information they might mistake for complete.

**Day 10 — Note Context in Chat**
- This day implements the *questioning* phase context strategy, which is distinct from the *generation* phase (Day 7)
- Before sending a chat message to the Claude API, aggregate all saved notes from all lectures in the **currently selected subjects** — by default the current subject only, expandable via the subject picker built in Day 8
- Include aggregated notes as system context in every API call
- **Note format conversion — required before sending to Claude:** `Note.content` is stored as TipTap JSON in the database. Do NOT pass raw TipTap JSON to Claude — it is verbose, token-expensive, and harder to reason about than plain text. Before including notes in the API context, convert each note from TipTap JSON to plain text using `generateText()` from `@tiptap/core`:

```typescript
import { generateText } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

// note.content is a string in Prisma — must parse before passing to generateText,
// which expects a JSONContent object, not a string
const plainText = generateText(JSON.parse(note.content), [StarterKit])
// include plainText in the context sent to Claude, not note.content
```

This is the reverse of the forward pipeline (Claude markdown → HTML → TipTap JSON via `marked` and `generateJSON`). The rule is: TipTap JSON for storage and rendering in the editor, plain text for sending to Claude as input.
- During questioning, saved notes are the primary context — NOT the raw source. This is the core differentiator: the AI answers from what the student built and understood, not from the raw textbook
- Claude now answers questions with awareness of all saved notes across the selected subjects
- Cross-subject context is enabled automatically when the user adds a second subject in the picker — no additional API changes needed
- Test 1: ask a cross-lecture question within one subject, verify Claude uses saved note context rather than re-deriving from source
- Test 2: add a second subject in the picker, ask a cross-subject question, verify Claude draws on notes from both subjects simultaneously
- Edge case to handle: if a topic has not been generated as notes yet, the AI fills that gap from its training knowledge. This is acceptable and expected — the context reflects actual study progress. The natural fix is to generate that topic's notes first.

**Context window scaling — acknowledge and plan for it:**
claude-sonnet-4-6 has a 200k token context window. For typical MVP usage — one subject, moderate note enrichment — aggregated notes will be roughly 5,000–30,000 tokens, well within limits.

However, a full semester across multiple subjects with heavy enrichment could push toward limits. Fallback strategy for MVP: if total note token count exceeds 100,000, truncate by removing the oldest lecture notes first, keeping the most recently studied content. Log a warning when truncation occurs so it can be detected during testing.

Post-MVP: implement a proper retrieval approach — store note embeddings and retrieve only the most semantically relevant notes for each query rather than sending all notes every time. This is the right long-term solution but out of scope for the 3-week build.

**Day 11 — Persistent Chat History**
- Save every chat message to database (ChatMessage model)
- On chat panel load, retrieve full message history from database
- Send the most recent 50 messages with every new API call — see truncation strategy below
- Chat now persists across sessions — reopening the subject resumes the conversation

**Chat history truncation — required alongside note truncation:**
Day 10 handles note truncation at 100,000 tokens. But full chat history sent alongside notes can itself be tens of thousands of tokens for an active subject. The combined total — all notes plus full chat history — can still overflow even after note truncation.

Strategy: send only the most recent 50 messages rather than the full history. This preserves immediate conversation context while preventing overflow. Implement this cap from Day 11 onwards:

```typescript
const recentMessages = allMessages.slice(-50)
// send recentMessages as conversation history, not allMessages
```

If 50 messages proves insufficient in testing, increase the cap. The right number depends on average message length — monitor during Week 2 testing.
- **Store `lectureId` in `ChatMessage.metadata` for every message** — this is the data that powers the lecture filter built in Day 8. Every message must record which lecture was active when it was sent. Without this, the filter cannot work.
- Store additional metadata on each message: `requestType` (generation/question/analogy/clarification) — powers post-MVP Knowledge Gaps and personalisation features

**requestType classification — implementation approach:**
The dedicated Generate button from Day 8 cleanly handles generation vs Q&A — any message sent via the Generate button is type `generation`. Within Q&A messages, use keyword matching for MVP:

```
analogy       → message contains: "analogy", "example", "like", 
                "similar", "metaphor", "compare to"
clarification → message contains: "don't understand", "confused", 
                "explain again", "still not", "clarify", 
                "what do you mean", "simplify"
question      → everything else
```

This is a heuristic — it will misclassify edge cases. That is acceptable for MVP. The data still accumulates and can be re-classified or refined post-MVP when the Knowledge Gaps feature is built. Store the classification as-is and treat it as an approximation, not a reliable signal.

**Day 12 — Update Note from Chat (Core Workflow Feature)**
- This is the feature that completes Ikasio's core loop. Without it, enrichment from follow-up questions stays buried in chat history exactly as it does in NotebookLM and Claude.
- Add an "Update Note" action on assistant chat responses
- When triggered: send the existing target note content + the relevant chat elaboration to the Claude API with a prompt to merge them into one updated, structured note. The existing note content must be converted from TipTap JSON to plain text using `generateText()` before sending — the same reverse conversion as Day 10. Do NOT send raw TipTap JSON to Claude as merge input.
- Claude returns the merged result as markdown — convert to HTML with `marked`, then to TipTap JSON using `generateJSON` from `@tiptap/core` before saving (same pipeline as Day 7)
- Save the merged result back to the note in the database (the note's `content` field), preserving it as the AI's future context
- Increment `Note.updateCount` every time a merge happens
- Append the update type to `Note.updateHistory` on every merge — push a string describing the change ("Clarified", "Added analogy", "Added example") depending on the nature of the elaboration. For MVP, infer the type using the same keyword matching used for `requestType` in Day 11. The initial "Generated" entry is handled in the Day 7 note creation code — verify it is there before implementing Day 12.
- Let the user pick which note the elaboration merges into via a dropdown listing all notes in the current lecture. Do NOT attempt to infer relevance automatically — it is unreliable. A simple dropdown is more transparent and more reliable. Default selection: the most recently generated or viewed note in the current lecture.
- Display the note evolution badge on each note using both fields: "This note has evolved 7 times — Generated → Clarified → Added analogy." `updateCount` gives the number, `updateHistory` gives the type sequence joined with " → ". This makes the core product idea immediately tangible — notes visibly grow.
- Test: generate a note, ask a clarifying follow-up, merge it, confirm the note now contains the enriched explanation, the updateCount incremented, the updateHistory array has a new entry, and that the AI reads the merged note in the next session

**Day 13 — Unified Notes View & Search**
- Build a unified view within each subject showing all lectures and their notes
- Collapsible lecture sections — all notes visible in one scrollable revision view
- Basic text search across all notes within a subject, highlighting matching terms
- This is the revision view — everything in one place

**Day 14 — Week 2 Polish**
- Fix bugs from Days 8–13
- Improve loading states and error handling
- Improve chat UX (scroll to bottom on new message, loading indicator while Claude responds)
- Verify the full enriched-note loop end to end: generate → enrich via chat → merge → AI reads merged note next session
- Code review and cleanup

**Week 2 complete when:** User can chat with AI that has full context of all saved notes across all lectures in a subject, can merge chat enrichment back into structured notes in one action, and that context persists across sessions.

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
- Before sending notes to Claude, convert each note from TipTap JSON to plain text using `generateText()` from `@tiptap/core` — same approach as Day 10. Do NOT send raw TipTap JSON to Claude.
- Send all saved notes as plain text to Claude API with prompt to generate 5–10 questions and answers
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
- Connect production database (Supabase)
- Set all environment variables in Vercel dashboard
- Run migrations on production database
- Verify everything works end to end on live URL

**Day 21 — Final Polish, README, and Validation Launch**
- Fix any deployment bugs
- Write README for GitHub repository — lead with the outcome-based pitch: "You never lose an explanation that finally made something click. Every clarification automatically becomes part of your notes."
- Record a short demo walkthrough focusing on the core loop: generate → enrich → update note → AI reads merged note next session
- Update portfolio with Ikasio project entry
- Send the live URL to 10–15 students with one honest message: "I built this — try it for one study session and tell me if it's genuinely better than your current workflow." Their answers determine whether Ikasio is a product opportunity or a portfolio piece. Both outcomes are valuable. Neither can be known without asking.

**The metric that actually matters — week-3 unprompted return usage:**
Stated preference ("this is cool", "I'd switch") is a weak predictor of actual behaviour. The number that matters is: did the student open it again in week 3 without being reminded? Add a lightweight check — even a simple query of "did this account have any activity in the last 14 days?" against your own database — before deciding whether to invest further post-MVP. Sustained pull, not stated interest, is the signal that distinguishes a real product from a good demo.

**Beachhead over scatter:**
Send the URL to students in your own CS cohort at Curtin — people studying the same units, facing the same exams — rather than 10-15 unrelated people. One student telling three coursemates "use this for your OS exam" is how study tools actually spread. Concentrated signal from a tight community is more useful than scattered signal from unconnected individuals.

**Week 3 complete when:** App is live at a public URL, fully functional end to end, and in the hands of at least 10 real students from the same academic community.

---

## 1.5. AI Context Strategy (Core Architecture)

This is the single most important architectural concept in Ikasio. It defines what the AI reads as context at each phase, and it is the foundation of the product's differentiator. Getting this right is what separates Ikasio from NotebookLM and Claude Projects.

There are three distinct phases, each with a different context strategy. There is also an important distinction within the chat panel itself.

### The two types of chat interactions

Before the phases, this distinction must be understood:

**Generation requests** ("generate paging notes", "proceed to free space management") — these use the Phase 1 context strategy. The output is saved to the notes panel as a structured note. The chat panel only shows a brief confirmation. These are NOT saved as full `ChatMessage` records in the database — only the confirmation message is.

**Q&A questions** ("how does paging connect to virtual memory?") — these use the Phase 2 context strategy. The full response stays in the chat panel and IS saved as a `ChatMessage` record with `lectureId` in metadata.

### Phase 1 — Note Generation (Day 7)

When the user is actively generating notes from a lecture, topic by topic:

```
Context sent to Claude API:
1. Lecture.rawContent     ← the actual source material
2. Notes already generated in this lecture so far
3. Current session chat history
```

The raw source is the primary input here, because the AI is producing notes *from* the lecture. Including notes already generated keeps each new topic consistent in style and depth with what came before. This is the only phase where raw source content is the main context.

### Phase 2 — Questioning / Revision (Day 10)

When the user asks the AI a question — whether the same day or weeks later:

```
Context sent to Claude API:
1. All saved notes across ALL lectures in the subject
2. Most recent 50 chat messages (Day 11)
NOT included: raw source PDFs
```

Here the saved enriched notes are the primary context — not the raw source. The AI answers from what the student built and understood, across the entire subject. This is the core differentiator: every other tool defaults back to source material; Ikasio defaults to the student's understanding.

### Phase 3 — Note Enrichment (Day 12)

When the user merges a chat elaboration back into a note:

```
Context sent to Claude API:
1. The existing target note content
2. The relevant chat elaboration to merge in
Output: one updated, merged, structured note → saved to DB
```

This closes the loop. Enrichment that happened in chat becomes part of the permanent structured note, which then becomes Phase 2 context for every future session. Understanding compounds automatically.

### Why this matters

The distinction between Phase 1 (generate from source) and Phase 2 (answer from notes) is the whole game. A student generates notes from their lecture once. From then on, every interaction draws from their enriched notes — automatically, across every subject, forever. No re-uploading, no re-pasting, no manual re-adding of notes as sources.

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
  updateCount   Int      @default(0) // incremented every time note is enriched via Update Note from Chat
                                     // powers the note evolution badge in the UI
  updateHistory Json     @default("[]") // array of update type strings — e.g.
                                        // ["Generated", "Clarified", "Added analogy", "Added example"]
                                        // powers the full evolution badge: "Generated → Clarified → Added analogy"
  lectureId     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  lecture     Lecture          @relation(fields: [lectureId], references: [id], onDelete: Cascade)
  annotations NoteAnnotation[] // User annotations — why something clicked or didn't
}

model ChatMessage {
  id        String   @id @default(cuid())
  role      String   // "user" or "assistant"
  content   String   @db.Text
  subjectId String
  metadata  Json?    // stores: requestType (analogy/clarification/question),
                     // lectureId at time of message, wasMarkedUnclear, etc.
                     // Powers future AI personalisation features
  createdAt DateTime @default(now())

  // Relations
  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)
}

model NoteAnnotation {
  id        String   @id @default(cuid())
  noteId    String
  content   String   @db.Text // The annotation text written by the user
  type      String   // "understood" | "unclear" | "analogy_worked" | "revisit"
  createdAt DateTime @default(now())

  // Relations
  note Note @relation(fields: [noteId], references: [id], onDelete: Cascade)
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
  subjectId String   // subject-level only (intentional) — practice questions are generated
                     // from all notes in the subject for comprehensive exam preparation.
                     // Per-lecture question generation can be added post-MVP if needed.
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
│   │   │   ├── route.ts           ← CRUD: create, read, update, delete notes
│   │   │   └── generate/
│   │   │       └── route.ts       ← AI note generation (Day 7)
│   │   ├── chat/
│   │   │   └── route.ts           ← Q&A chat messages (Day 9)
│   │   ├── study-sessions/
│   │   │   └── route.ts
│   │   └── practice-questions/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx                ← Landing / redirect to dashboard
├── components/
│   ├── sidebar/
│   │   ├── sidebar.tsx               ← Day 4: lists subjects, active highlight
│   │   ├── create-subject-modal.tsx  ← Day 4: modal creation flow
│   │   └── subjects-provider.tsx     ← Day 4: shared Context for subject list state
│   ├── note-editor/
│   ├── chat-panel/
│   ├── pomodoro-timer/
│   ├── practice-questions/
│   └── ui/                     ← Reusable primitives (button, modal, etc)
├── docs/                       ← Project documentation
│   ├── ikasio-problem-statement.md
│   └── ikasio-technical-plan.md
├── lib/
│   ├── prisma.ts               ← Prisma client singleton
│   ├── auth.ts                 ← NextAuth config (PrismaAdapter, Node.js runtime —
│   │                              imported by the app, never by middleware)
│   └── claude.ts               ← Claude API helper functions
├── prisma/
│   └── schema.prisma
├── auth.config.ts               ← Edge-safe NextAuth config (Day 3) — providers + pages
│                                   only, no PrismaAdapter. Imported by middleware.ts.
├── middleware.ts                 ← Route protection (Day 3) — runs in Edge Runtime,
│                                   imports from auth.config.ts, never from lib/auth.ts
├── AGENTS.md                   ← AI coding assistant conventions
├── .env
├── .env.example
└── package.json
```

---

## 4. Environment Variables

```bash
# Database — replace with real Supabase connection string in Day 2
DATABASE_URL="postgresql://..."

# NextAuth — NEXTAUTH_SECRET already generated in Day 1, do not regenerate
NEXTAUTH_SECRET="already-set-in-.env"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth — credentials added in Day 3
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Claude API — key added when starting AI work in Day 7
ANTHROPIC_API_KEY=""
```

**API key strategy for MVP:**
The `ANTHROPIC_API_KEY` is the developer's own key (Brian's), stored in `.env` and shared by all users of the app. This is appropriate for a portfolio project where usage is controlled and low.

Implications:
- Users do not need their own Anthropic account to use Ikasio
- All API costs are charged to the developer's account
- If the app were to scale beyond a small user base, users would need to provide their own API keys

This is the standard approach for portfolio and demo applications. It should be stated clearly in the README so anyone evaluating the project understands the model.

**Rate limiting and cost control — required before Day 21:**
Before sharing the live URL with 10–15 students for validation, implement a basic cost safeguard. Without any rate limiting, multiple students testing simultaneously can exhaust the shared API budget quickly — this is not a hypothetical risk, it is a real one.

Minimum safeguards to implement before the Day 21 validation launch:
- Add a global daily request cap in the Claude API routes — if total daily API calls exceed a set threshold (e.g. 200 calls/day), return a graceful "service temporarily unavailable" response rather than making further API calls
- Share the URL only with specific known users directly — do not post it publicly or on social media before usage controls are in place
- Monitor the Anthropic API usage dashboard daily during the validation period
- Set a billing alert in the Anthropic console so unexpected spend triggers a notification immediately

This is not a full rate-limiting system — it is a minimal safeguard against billing surprise during the validation window. A proper per-user rate limit and a user-supplied API key model can be evaluated post-MVP if the product moves forward.

---

## 5. Progress Tracker

Updated in the manager chat at the end of each day.

### Week 1 — Foundation
- [x] Day 1 — Project setup ✅
- [x] Day 2 — Database setup ✅
- [x] Day 3 — Authentication ✅
- [x] Day 4 — Subject organisation ✅
- [ ] Catch-up — sign-out (Day 3 scope) + delete subject UI (Day 4 scope)
- [ ] Day 5 — Lecture creation
- [ ] Day 6 — Note editor (TipTap)
- [ ] Day 7 — AI note generation

### Week 2 — The AI Layer
- [ ] Day 8 — AI chat panel UI
- [ ] Day 9 — Claude API integration for chat
- [ ] Day 10 — Note context in chat
- [ ] Day 11 — Persistent chat history
- [ ] Day 12 — Update note from chat (core workflow feature)
- [ ] Day 13 — Unified notes view & search
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
