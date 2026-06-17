# Ikasio — Problem Statement & Product Definition

> **Ikasio** — from the Basque word *ikasi*, meaning "to learn." A place where learning is captured, preserved, and built upon.

---

## 1. Background: The Real Workflow

Before identifying what to build, the actual day-to-day study workflow was mapped out honestly.

**Current tools used:**
- **Claude** — primary tool for understanding content. Lecture slides are pasted in, Claude explains them step by step, topic by topic.
- **Notion** — note storage. Claude's output is manually copied and pasted here.
- **A separate timer app** — rarely used because it lives in a different app and the switching friction is just enough to skip it.

**What this workflow actually looks like in practice:**

```
1. Open Claude → paste lecture file → write prompt explaining how to teach it
2. Claude explains content step by step
3. Manually copy Claude's output → paste into Notion
4. Repeat for every lecture, every session
5. Switch to a separate timer app (or don't bother)
6. At revision time: reopen each Claude chat one by one
```

This is the baseline. Everything else flows from understanding what's broken here.

---

## 2. The Pain Points (Discovered Honestly)

### Pain Point 1: Re-pasting the same prompt every single session

Every new Claude chat requires the same instruction:

> *"Here is the first material, I need you to give me complete notes, however instead of putting the notes all at once, please cover it step by step, topic by topic, subtopic by subtopic, I need to understand fully before proceeding to the next one"*

Without this prompt, Claude doesn't know how to teach. Writing it every session is friction. More importantly, Claude's teaching style is not guaranteed to be consistent across chats even with the same prompt — different sessions produce different formatting, different depth, different tone.

**Status: Partially solved by Claude Projects Instructions.** Writing the instruction once in the Project Instructions field applies it to every chat in that project automatically. Testing confirmed this maintains consistency across two chats.

---

### Pain Point 2: Notes are homeless

After Claude explains a lecture, that explanation only exists inside the chat. To actually keep it, the output has to be manually copied and pasted into Notion. This creates two problems:

- **It's tedious.** Every session involves copy-pasting between apps.
- **The notes and the AI are permanently disconnected.** Once the notes live in Notion, Claude has no awareness they exist. If you want Claude to reference them, you have to paste them back in manually.

**Status: Not solved by any existing tool.**

---

### Pain Point 3: Revision is fragmented

At exam time, a subject like Operating Systems has 6 lectures — 6 separate Claude chats. Revising means:

- Reopening each chat one by one
- No unified view of the entire subject
- Cannot ask a question that spans multiple lectures simultaneously
- No searchable, organised record of what was actually learned

Claude Projects partially addresses this — a new chat inside a project can read all uploaded source PDFs, enabling some cross-lecture questions. But this only reads the **raw source material**, not the **enriched notes** built through the learning sessions.

**Status: Partially solved by Claude Projects — but a critical gap remains (see Section 4).**

---

### Pain Point 4: Progress is invisible

There is no visible sense of momentum while studying. No feedback that says "you are moving forward." This is a real psychological gap — without tangible progress indicators, the brain seeks feedback elsewhere (phone, social media). A progress tree or visual tracker is not a gimmick; it directly addresses the motivation problem.

**Status: Not solved by any existing tool.**

---

### Pain Point 5: The timer lives in a different app

A Pomodoro timer in a separate app has just enough friction to make it easy to skip. The result: study sessions are unstructured and untracked.

**Status: Not solved by any existing tool.**

---

## 3. What Claude Projects Solves (And What It Doesn't)

Claude Projects was the strongest candidate to make this app unnecessary. It needed to be stress-tested honestly before building anything.

### What Claude Projects does well

| Feature | Claude Projects |
|---|---|
| Persistent lecture context across chats | ✅ |
| Consistent teaching style via Project Instructions | ✅ |
| Cross-lecture questions from source PDFs | ✅ |
| Organised by subject | ✅ |

### Where Claude Projects falls short

| Feature | Claude Projects |
|---|---|
| Notes saved automatically from AI output | ❌ |
| AI reads your saved notes (not just source PDFs) | ❌ |
| Cross-lecture questions from your enriched notes | ❌ |
| Progress visualisation | ❌ |
| Integrated Pomodoro timer | ❌ |
| Session history and time tracking | ❌ |
| Unified view of all notes per subject | ❌ |

---

## 4. The Critical Gap: Source Material vs. Your Understanding

This is the most important distinction in the entire product definition.

When you study, you don't just receive the PDF content. You **enrich** it. Over the course of a session, you ask things like:

- *"Can you give me an analogy for this?"*
- *"Explain this differently, I still don't get it"*
- *"Add an example for this concept"*
- *"Summarise this section more simply"*

The resulting output — the analogy that made paging click, the alternative explanation of virtual memory, the simplified summary you actually understood — **none of that is in the PDF.** It lives only inside the Claude chat. When that chat ends, it is effectively lost. It cannot be found by other chats. It cannot be referenced in revision. It cannot be read by Claude in a future session.

Claude Projects reading the raw PDF will answer:
> *"What does the lecture say about paging?"*

Your app reading your saved notes will answer:
> *"Based on how you already understand paging from your Week 3 session, how does it connect to what we're covering now about virtual memory?"*

**These are fundamentally different answers.** One reads the textbook. The other reads your brain.

---

## 5. The Precise Differentiator

> **Claude Projects gives AI context of your source material.**
> **Your app gives AI context of your understanding.**

Source material is the lecture. Understanding is what you built from it — the enriched, personalised, annotated notes that came from your actual learning process. These are not the same thing, and no existing tool connects them.

---

## 6. What the App Actually Does

The app is a **personal study workspace** where the AI lives inside your notes, not in a separate tab.

### The core experience

1. You open a subject (e.g. *Operating Systems*)
2. You paste or upload your lecture content
3. The AI processes it and generates structured notes — automatically saved, not copied manually
4. You can write your own notes alongside the AI-generated ones
5. A Pomodoro timer runs in the background while you work
6. At any point, you can ask the AI a question — it already has full context of **all your saved notes** across all lectures in this subject, not just the current session
7. The AI generates practice questions for revision
8. A progress tree grows as you study — time logged, topics covered, questions answered
9. At exam time: all notes are in one place, unified, searchable, and the AI already knows all of it

### What makes this different from Claude + Notion + timer

| | Claude + Notion + Timer | Claude Projects + Notion + Timer | This App |
|---|---|---|---|
| AI explains lectures | ✅ | ✅ | ✅ |
| Consistent teaching style | ❌ manually | ✅ with instructions | ✅ built in |
| Notes saved automatically | ❌ copy-paste | ❌ copy-paste | ✅ |
| AI reads your saved notes | ❌ | ❌ | ✅ |
| Cross-lecture questions from your notes | ❌ | ❌ | ✅ |
| Cross-lecture questions from source PDFs | ❌ | ✅ | ✅ |
| Integrated Pomodoro timer | ❌ | ❌ | ✅ |
| Progress visualisation | ❌ | ❌ | ✅ |
| Session history and time tracking | ❌ | ❌ | ✅ |
| Unified note view per subject | ❌ | ❌ | ✅ |

---

## 7. MVP Feature Scope (3-Week Build)

Everything below is the minimum to validate the core value proposition. Nothing outside this list is in scope for MVP.

### Week 1 — Foundation
- Authentication (sign up / log in via NextAuth.js)
- Subject/unit organisation (sidebar: list of subjects, click to open)
- Simple note editor (TipTap library: headings, bullet points, plain text — not Notion-level, just functional)
- Paste lecture content → AI generates structured notes → notes saved automatically to that subject

### Week 2 — The AI Layer
- AI chat panel within a subject — reads from all saved notes in that subject as context
- Context is maintained across sessions (notes are in the database, sent with every API call)
- Notes are searchable and viewable in a unified subject view

### Week 3 — Progress & Motivation
- Pomodoro timer integrated into the workspace, logs time per subject
- AI-generated practice questions based on saved notes
- Progress visualisation (tree or equivalent) — tracks time studied, topics covered, questions attempted

### Explicitly out of scope for MVP
- Collaboration or sharing
- Mobile app
- File upload / PDF parsing (paste-as-text is sufficient to start)
- Advanced rich text (tables, databases, embeds)
- Accountability partner / notification system
- Spaced repetition system

---

## 8. The Value Proposition (One Sentence)

> Ikasio is a study workspace that automatically saves AI-generated notes and gives the AI full context of everything you've learned — so revision is unified, context is never lost, and you never have to re-explain yourself to Claude again.

---

## 9. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js with TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js |
| Database | PostgreSQL (via Prisma ORM) |
| Note Editor | TipTap |
| AI | Claude API (claude-sonnet-4-6) |
| Deployment | Vercel (frontend) + Supabase or Railway (database) |

All of this is within the existing skill set. No new languages or frameworks required.
