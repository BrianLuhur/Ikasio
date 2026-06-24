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

### Pain Point 2: Understanding is fragmented and structurally inaccessible

When a study session ends, the enriched understanding built through it faces two problems — depending on what the student does.

**If you copy it to Notion:** The notes live in Notion but the AI has no awareness they exist. Claude cannot read your Notion notes. If you want Claude to reference them in a future session, you have to paste them back in manually. The notes and the AI are permanently disconnected.

**If you keep it in Claude:** The understanding only exists inside that specific chat. A semester of OS looks like this:

```
Chat A: Paging
Chat B: Virtual Memory
Chat C: CPU Scheduling
Chat D: Deadlocks
Chat E: File Systems
```

Three weeks before finals, you want to ask: *"Compare how paging, virtual memory, and file system caching relate to each other."*

Which chat do you open? A? B? E? The knowledge is scattered. There is no unified view. There is no way to ask a question across chats simultaneously. And there is no structured record of what was actually understood — only a chronological log of messages.

This reveals a deeper structural problem: **chats are chronological, but knowledge is hierarchical.** A chat is excellent for learning in the moment. It is a terrible structure for long-term retrieval. A good note organises knowledge like this:

```
Operating Systems
 ├─ Memory Management
 │   ├─ Paging
 │   ├─ Segmentation
 │   └─ Virtual Memory
 ├─ CPU Scheduling
 └─ Deadlocks
```

A chat organises the same knowledge like this:

```
Message 1 → Message 2 → Message 3 → ... → Message 247
```

Ikasio solves both problems simultaneously: notes are saved automatically from the AI output (no copy-pasting), and they are structured hierarchically by subject and lecture (no more "which chat do I open?").

**Status: Not solved by any existing tool.**

---

### Pain Point 3: Revision is fragmented

At exam time, a subject like Operating Systems has 6 lectures — 6 separate Claude chats. Revising means:

- Reopening each chat one by one with no way to know which one contains what you need
- No unified view of the entire subject
- Cannot ask a question that spans multiple lectures simultaneously
- No searchable, organised record of what was actually learned — only raw conversation logs

Even if you do reopen the right chat, you're searching through hundreds of messages chronologically to find the one analogy that clicked, the one clarification that mattered. Chats were designed for conversation, not for retrieval.

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

## 4. What About NotebookLM?

NotebookLM is the most capable competitor and worth addressing with complete honesty. It allows uploading source documents, asking cross-document questions, and generating quizzes — all grounded in your uploaded material. It now also saves chat history automatically and uses a large context window. It is free.

This section was stress-tested hard, because a disciplined NotebookLM user can get surprisingly close to Ikasio. The honest differentiators that survive scrutiny are below.

### What NotebookLM can actually do

It must be said plainly: NotebookLM can generate enriched notes. If you ask it to explain a concept, give analogies, and merge that elaboration into structured notes, it will. The AI generates the enriched notes, so **within that same session** it has full context of them — because they are sitting in the conversation. Persistent chat history means that within a single notebook, that conversation now survives across sessions too.

So the original claim "your enriched understanding is lost when the chat closes" is **not accurate** for NotebookLM today. It is important to be honest about this.

One more honest point: **Ikasio also requires the lecture source.** To generate notes, you must paste the raw lecture content in first. Every tool needs the source to produce anything — that is identical across NotebookLM, Claude, and Ikasio. What changes is what happens after.

### Where NotebookLM genuinely falls short

The real gap is not capability — it is **automatic context routing** and **architecture**.

**1. Saved notes are not automatically AI context.** NotebookLM is a closed retrieval system grounded in your *sources*. When you save an enriched note to the noteboard, the AI does not automatically read it on your next question — it returns to the source material. To make the AI use your enriched note as context, you must manually add that note back as a source. This is a manual step most students never take. In Ikasio, the enriched note *is* the AI's primary context automatically, with no manual step, in every session.

**2. Context is locked per notebook.** There is no cross-notebook search and no unified knowledge graph. A student studying Operating Systems and Computer Networks in separate notebooks cannot ask a single question that draws on enriched understanding from both at once. Ikasio stores all notes across all subjects in one database and can pass them as combined context. This is the strongest differentiator and cannot be replicated in NotebookLM.

**3. The right workflow requires constant discipline.** Staying in one notebook, manually saving each useful response, manually re-adding notes as sources, never starting a fresh chat — the correct behaviour is possible but requires effort at every step. Ikasio makes the correct behaviour the automatic default.

### What if a user manually adds all enriched notes as sources?

This is the strongest challenge to Ikasio's pitch and it deserves a direct answer.

A disciplined NotebookLM user who saves every enriched note and manually re-adds each one as a source does narrow the within-subject difference significantly. For a single topic studied in a single session, this workflow produces a similar result to Ikasio. That is honest and worth stating plainly.

**What remains genuinely different for even that disciplined user:**

**1. The friction scales badly.** One topic, one session: manageable. A full semester:

```
6 lectures × 4 topics each × multiple enrichments per topic
= 50+ manual save and re-add operations
```

Every missed step breaks the continuity. Ikasio eliminates all 50+ operations. The correct behaviour is the automatic default.

**2. Cross-subject context is architecturally impossible.** This one has no workaround. A student who has perfectly executed the manual workflow within their OS notebook still cannot ask one question that draws simultaneously on enriched notes from Operating Systems and Computer Networks. Notebooks are islands by design. No amount of discipline changes that.

**3. The noteboard is flat.** Even after manually adding enriched notes as sources, they sit in an undifferentiated list. Ikasio organises everything as Subject → Lecture → Note — immediately navigable, searchable, and structured for retrieval rather than conversation.

**4. No personalisation accumulates.** A disciplined NotebookLM user who perfectly replicates Ikasio's note workflow still has none of the learning history — no knowledge gaps tracking, no record of which analogies worked, no understanding timeline. These accumulate in Ikasio automatically from the first session and cannot be transferred to NotebookLM even if every feature were copied.

The honest answer is: for within-subject use by a highly disciplined student, the difference narrows. For the actual student population — studying across multiple subjects, across a full semester, without the discipline to execute 50+ manual operations consistently — Ikasio's advantage is real and compounding.

### The honest conclusion

Ikasio's advantage is **not** that it can do something technically impossible elsewhere. A motivated, disciplined user could assemble much of this workflow manually in NotebookLM or Claude Projects. Ikasio's advantage is that it removes the friction and makes the correct workflow automatic — and it adds one thing that genuinely cannot be replicated: **AI context that spans every subject simultaneously, drawn from your enriched notes rather than raw source material.**

That is a narrower claim than "no tool does this." It is also a true one. Friction removal and workflow automation are legitimate product foundations — Notion did not invent note-taking, and Spotify did not invent streaming. They won on experience. Ikasio competes on the same basis, plus one real architectural advantage.

### The competitive landscape summarised

| Capability | Claude Projects | NotebookLM | ChatGPT | Ikasio |
|---|---|---|---|---|
| Generate enriched notes via conversation | ✅ | ✅ | ✅ | ✅ |
| Persist enriched notes across sessions | Manual re-upload | ✅ within a notebook | ⚠️ memory stores facts, not notes | ✅ automatic |
| Enriched notes auto-used as AI context | ❌ manual | ❌ manual re-add as source | ⚠️ partial, unstructured | ✅ automatic |
| Cross-subject AI context | ❌ | ❌ | ❌ | ✅ |
| Notes saved automatically from AI output | ❌ | ⚠️ manual click | ❌ | ✅ automatic |
| Structured, editable, organised notes | ❌ | ⚠️ flat noteboard | ❌ | ✅ subject → lecture |
| Integrated Pomodoro timer | ❌ | ❌ | ❌ | ✅ |
| Progress visualisation | ❌ | ❌ | ❌ | ✅ |
| Free to use | ✅ | ✅ | ⚠️ limited free tier | Requires API key |

### What About ChatGPT Memory?

ChatGPT now has persistent memory across sessions. This is a real competitive development that the original analysis missed and needs to be addressed honestly.

**What ChatGPT memory actually does:**
ChatGPT's memory stores facts and preferences about you across conversations — things like "Brian is a software engineering student at Curtin University" or "Brian prefers step-by-step explanations." This is genuinely useful and partially addresses the "AI starts from scratch every session" problem.

**Where it falls short for Ikasio's use case:**

**1. Memory stores facts, not structured notes.** ChatGPT remembers things *about* you, not the enriched content *you built*. It cannot store and retrieve "the filing cabinet analogy Brian used to understand paging in his Week 3 OS session." That enriched note content — the specific explanations, analogies, and elaborations — still lives only in the conversation where it was generated.

**2. No subject-organised knowledge base.** ChatGPT memory is a flat list of remembered facts. There is no Subject → Lecture → Note hierarchy, no searchable unified view, and no structured revision interface. At exam time, you still cannot navigate to "all my OS notes" in any organised way.

**3. Cross-subject context from enriched notes remains impossible.** ChatGPT memory can remember that you study OS and Networks, but it cannot hold your enriched notes from both subjects and answer questions that draw on the specific analogies and explanations you built in each.

**4. Notes are not first-class objects.** In Ikasio, notes are editable, searchable documents that exist independently of any conversation. In ChatGPT, there are no notes — only conversations and a flat memory store.

**The honest position:** ChatGPT memory narrows the "AI forgets between sessions" gap. It does not close the "chats are chronological, knowledge is hierarchical" gap. Ikasio's differentiator is not memory — it is structured, subject-organised, enriched notes that automatically become the AI's primary context. ChatGPT memory and Ikasio notes are solving adjacent but different problems.

### What About Vertical AI Study Tools?

The competitive scan above covers general-purpose AI tools. There is also a vertical category — tools built specifically for students — that needs to be addressed honestly. This category is more crowded than the general-purpose comparison suggests.

**RemNote** is the most significant overlap. It has over one million users, hierarchical course organisation (notes organised by course, unit, and topic rather than chronologically), AI that generates flashcards and structured notes from your material, spaced repetition, and an AI tutor marketed as context-aware. It is the closest existing product to what Ikasio is building and it has years of head start with real distribution.

**StudyFetch** is a funded competitor that turns uploaded lecture slides into structured notes with AI-generated flashcards, quizzes, and an AI tutor. It has user testimonials about turning lecture slides into practice questions for better exam results.

**Knowt, YouLearn, Opennote, and LectureNotesAI** are all doing some version of "upload material → AI structures it → chat with AI that has that context," several with YC backing.

**What this means for Ikasio's position:**

After reviewing the vertical competitors honestly, the following conclusions stand:

Things these tools already do that Ikasio cannot claim as unique:
- Hierarchical notes organised by course and topic
- AI that generates structured notes from lecture material
- AI tutoring with awareness of your uploaded content
- Spaced repetition and flashcard generation

Things that remain genuinely not found in any of these tools:
- **Update Note from Chat with evolution history** — the specific mechanic of merging a chat elaboration back into the canonical note with one click, tracking the full evolution ("Generated → Clarified → Added analogy") as a first-class note property. None of the above advertise this mechanic.
- **Cross-subject combined AI context** — asking one question that simultaneously draws on enriched notes from two different subjects. RemNote, StudyFetch, and the others are siloed per-course, exactly as NotebookLM is siloed per-notebook. No amount of discipline overcomes this architectural constraint.

**The honest narrowed claim:**

The original framing — "no existing tool saves enriched AI notes automatically and makes the AI read those notes as primary context" — is too strong. RemNote and StudyFetch do versions of this.

The honest, defensible claim is narrower:

> No existing tool automatically merges chat elaborations back into your canonical structured notes with a visible evolution history, or lets you ask one question that draws simultaneously on enriched notes from multiple subjects.

That is a smaller claim. It is also a true one.

**What nobody has built yet — including Ikasio:**

The actual long-term moat — accumulated personal learning history, knowledge gap tracking, "explain it the way I understand things" — does not exist in RemNote, StudyFetch, or Ikasio today. Whoever builds that well first, with distribution, wins the category. Ikasio's post-MVP roadmap (Versions 2-4) points directly at this. It is an open race.

---

## 5. The Critical Gap: Automatic Context, Not Lost Context

This is the most important distinction in the entire product definition, and it must be stated precisely.

When you study, you don't just receive the PDF content. You **enrich** it. Over the course of a session, you ask things like:

- *"Can you give me an analogy for this?"*
- *"Explain this differently, I still don't get it"*
- *"Add an example for this concept"*
- *"Summarise this section more simply"*

The AI generates that enriched output — the analogy that made paging click, the alternative explanation of virtual memory, the simplified summary you actually understood. **None of that is in the original PDF.** It is built through your learning process.

### The precise gap

The honest gap is *not* that this enriched understanding is impossible to keep — modern tools can persist it within a session or notebook. The gap is **what the AI automatically reads as context on your next question, and across how wide a scope.**

There is also a structural gap that goes beyond context routing. Chats are chronological — understanding is buried inside a linear sequence of messages with no hierarchy, no organisation, no way to retrieve a specific concept without scrolling through everything. Notes are hierarchical — understanding is organised by subject, lecture, and topic, immediately navigable and retrievable. Ikasio captures understanding in the right structure from the moment it is generated, not as a side effect of a conversation.

In Claude Projects and NotebookLM, the AI defaults to your *source material*. Your enriched notes only become AI context through manual steps — re-uploading a note as a project file, or re-adding a saved note as a source. And even then, the context is locked to that one project or notebook.

In Ikasio, your enriched notes *are* the AI's primary context — automatically, with no manual step, across every subject you study.

### The two answers

A tool reading the raw source will answer:
> *"What does the lecture say about paging?"*

Ikasio, reading your saved enriched notes automatically, will answer:
> *"Based on how you already understand paging from your Week 3 session — including the filing cabinet analogy that worked for you and the gap you flagged on counting — here's how it connects to virtual memory."*

**These are fundamentally different answers.** One reads the textbook. The other reads what you built from it, without you doing anything to make that happen.

### Why "just use one long chat" doesn't solve it

A single, never-closed chat for an entire semester is not how disciplined students actually study. A disciplined Claude user creates one chat per topic — Chat A for Paging, Chat B for Virtual Memory — keeping each chat focused and short. That approach avoids context window problems entirely and is the correct way to use Claude Projects.

And a disciplined user who organises one chat per topic always knows where to go. Paging question → open Paging chat → ask for the analogy. The search problem largely disappears for an organised user.

What genuinely survives after giving the disciplined user full credit:

**The friction gap — real but small.** Even in a well-organised per-topic chat, the analogy requires you to open the right chat and ask for it. In Ikasio the analogy is merged into the note permanently — visible the moment you open the note, without prompting. For a disciplined user this is friction reduction, not a capability difference. It is a small but real advantage.

**The cross-topic question gap — the only surviving capability argument.** When you want to ask "how does my understanding of paging connect to what I learned about virtual memory?", those are in separate chats. You have to pick one, paste context from the other manually, or start a new chat that reads raw source PDFs instead of your enriched understanding. No amount of discipline or prompt engineering solves this if the understanding lives in separate chats. This is architecturally unsolvable in Claude Projects.

**The honest conclusion for a disciplined user:** The gap narrows significantly. The friction advantage is small. The one thing that remains genuinely impossible — asking one question that draws simultaneously on enriched understanding from two separate topics or subjects — is the core architectural differentiator that holds up under every challenge.

---

## 6. The Two Differentiators — and Which One Is Stronger

> **Other tools default the AI to your source material. You enrich your notes, but making the AI read that enrichment takes manual work, and the context is locked to one project or notebook.**
>
> **Ikasio defaults the AI to your enriched notes — automatically, across every subject, with no manual step.**

There are two distinct differentiators here, and understanding their hierarchy matters for explaining Ikasio accurately.

**Differentiator 1 — Automatic cross-session context (daily value)**

Within the same session, every tool has the enriched notes in context — the AI just generated them, they are right there in the conversation. The difference appears when you come back later. In NotebookLM and Claude Projects, the AI defaults back to source material in a new session unless you manually re-add your enriched notes. In Ikasio, enriched notes are automatically the AI's primary context every time you open the subject — no re-adding, no re-uploading, no manual step of any kind.

This is what you feel every day. It is the friction that disappears.

A disciplined user *could* replicate this in NotebookLM by manually re-adding notes as sources every session. That is possible. It is also exactly the kind of friction that the problem statement describes as the reason the problem exists in the first place.

**Differentiator 2 — Cross-lecture and cross-subject context (the defensible differentiator)**

This one is harder to challenge. NotebookLM and Claude Projects are architecturally locked to one notebook or one project. No amount of discipline lets a student ask one question that draws simultaneously on enriched notes across lectures.

To be precise: cross-LECTURE context within one subject is what students need most and most frequently. A question that connects Week 2 paging to Week 5 virtual memory happens every study session. Ikasio handles this automatically because all notes within a subject are in one database and sent as combined context.

Cross-SUBJECT context — connecting OS to Computer Networks, for example — is a real differentiator but a less frequent need. Students rarely ask questions that span entirely separate subjects in one query. It is worth having, but it should not be the headline.

**How cross-subject context works in Ikasio:**

By default the AI reads notes from the current subject only. When a student needs cross-subject context, a subject picker in the chat panel lets them explicitly add other subjects:

```
Context: [Operating Systems ✓] [+ Add subject ▼]
                    ↓
Context: [Operating Systems ✓] [Computer Networks ✓]
```

The AI now draws on enriched notes from both subjects simultaneously in its answer. The student is in control of which subjects are included. This is intentional by design — cross-subject context is powerful but should not fire automatically for every question.

Post-MVP, this evolves into a global chat at the dashboard level with access to all subjects simultaneously — a richer experience that the current architecture supports without any schema changes.

The headline is cross-lecture context within one subject. The cross-subject capability is a supporting differentiator that survives the "but a disciplined user could just..." pushback — because no amount of discipline lets you query across separate notebooks simultaneously.

**The honest hierarchy:**

Lead with Differentiator 1 in conversation — it is the most relatable, the one every student immediately recognises as a pain point. The outcome-based version: *"You never lose an explanation that finally made something click."* and *"Every clarification automatically becomes part of your notes."* These are easier to understand than any technical description of context routing.

Close with Differentiator 2 when challenged — it is the one that survives the "but a disciplined user could just..." pushback, because no amount of discipline overcomes an architectural constraint.

**The competitive risk to acknowledge honestly:**

Google can copy note generation, note storage, chat, and timers. If NotebookLM adds automatic note syncing tomorrow, a significant portion of Differentiator 1 narrows. This is a real risk.

What is genuinely hard to copy is a deeply personalised learning history that has been accumulating for months — the specific analogies that worked for a specific student, the gaps they flagged, the concepts they demonstrated understanding of, the topics they keep forgetting. That data is personal and it compounds over time. The longer a student uses Ikasio, the more personalised it becomes, and the harder it is to replicate that history in a competitor even if they copy every individual feature.

This is why the post-MVP roadmap (Section 10) matters as much as the MVP itself — it points toward the moat that large platforms cannot easily replicate.

---

## 7. What the App Actually Does

The app is a **personal study workspace** where the AI lives inside your notes, not in a separate tab.

The simplest way to describe the difference: every other tool puts the AI beside your notes. You write or generate notes, then separately ask the AI questions. Ikasio puts the AI inside your notes. The AI reads what you built, not what the textbook says, and every clarification you get automatically becomes part of those notes.

### The core experience

1. You open a subject (e.g. *Operating Systems*)
2. You paste or upload your lecture content
3. The AI processes it and generates structured notes — automatically saved, not copied manually
4. You can write your own notes alongside the AI-generated ones
5. You ask follow-up questions in the chat panel — when an explanation clicks, one action merges it into the relevant note. The note evolves and tracks how many times it has been enriched: *"This note has evolved 7 times — Generated → Clarified → Added analogy → Added example → Merged explanation."* This makes the core idea tangible: notes don't just get stored, they grow.
6. A Pomodoro timer runs in the background while you work
7. At any point, you can ask the AI a question — it already has full context of **all your saved notes** across all lectures in this subject, not just the current session
8. The AI generates practice questions for revision
9. A progress tree grows as you study — time logged, topics covered, questions answered
10. At exam time: all notes are in one place, unified, searchable, and the AI already knows all of it

### The two-panel layout

The subject view has two panels that serve completely different purposes. Understanding this separation is important:

```
Operating Systems — Subject View

NOTES PANEL (left)             CHAT PANEL (right)
──────────────────             ──────────────────
Lecture 3                      [Filter: All lectures ▼]
├── Paging (evolved 4x)        
├── Virtual Memory             You: "generate paging notes"
└── Free Space Mgmt            AI: Notes saved → see notes panel
                               [confirmation only, not the notes]
Lecture 5                      
└── File Systems               You: "how does paging connect
                                    to virtual memory?"
                               AI: [reads all notes, answers
                                    from your understanding]
                               
                               You: "give me an analogy"
                               AI: [filing cabinet analogy]
                               [Update Note] ← merges into
                                              Paging note
```

**The notes panel** is your knowledge base. It contains structured, editable, permanently saved notes organised by lecture. This is where you go to revise. This is what the AI reads as context. This does not scroll through conversation history.

**The chat panel** is your conversation interface. It contains two types of interactions:

- **Generation requests** — "generate paging notes", "proceed to free space management." These trigger note creation. The output goes to the notes panel. The chat only shows a brief confirmation: "Paging notes generated and saved." The full note content does not live in the chat.

- **Q&A questions** — "how does paging connect to virtual memory?", "give me an analogy." These stay in the chat panel as persistent conversation history, saved to the database per subject.

This separation means at revision time you open the notes panel — not the chat — to find your Lecture 3 content. The notes are structured and immediately navigable. The chat is chronological and meant for conversation, not retrieval.

**Lecture filter on the chat panel**

Since the chat panel contains Q&A from all lectures mixed together, a lecture filter allows narrowing the visible chat history:

```
[Filter: All lectures ▼]
[Filter: Lecture 3 only]  ← shows only Lecture 3 Q&A
```

This is powered by `ChatMessage.metadata.lectureId` — every message stores which lecture was active when it was sent. This data is captured automatically from Day 11 onwards.

**Subject context picker**

By default the AI reads notes from the current subject only. When the student needs cross-subject context, a picker lets them add other subjects explicitly:

```
Context: [Operating Systems ✓] [+ Add subject ▼]
```

The AI then draws on enriched notes from every selected subject simultaneously. Selection is intentional — cross-subject context is powerful but should not fire automatically for every question. Default is always the current subject only.

**When generating notes**, the AI reads your raw lecture content as the source — producing notes topic by topic, staying consistent with topics already covered. This is the only time the raw source is the main input.

**When answering questions**, the AI reads your saved enriched notes — not the raw source. Across every lecture, across every subject. This is what makes Ikasio answer from your understanding rather than the textbook.

When you enrich a note through chat — asking for an analogy, a clarification, a simpler explanation — one action merges that back into the structured note. From then on, it is part of what the AI reads automatically, forever. Your understanding compounds with every session.

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

### The workflow comparison: the same study session in each tool

This is the clearest way to see the difference. The scenario: studying one Operating Systems lecture covering Paging, Virtual Memory, and Free Space Management — generating notes topic by topic, asking clarifying questions, then revising weeks later.

**In NotebookLM:**
```
1. Upload lecture PDF as a source
2. Ask it to generate notes on Paging → appears in chat
3. Manually click "Save to Note" to keep it
4. Ask for an analogy → AI explains → manually save again
5. Ask it to merge → manually save the merged version
6. To make the AI USE that merged note later: manually
   download it and re-add it as a source
7. Repeat for every topic
8. Weeks later: the AI answers from the source PDF unless
   you re-added every enriched note as a source
9. Studying a second subject? It's in a separate notebook —
   no cross-subject questions possible
```

**In Claude Projects:**
```
1. Upload lecture PDF to the project
2. In a chat, generate notes topic by topic
3. Enriched notes exist only inside that chat
4. To preserve across chats: manually copy notes out,
   re-upload as a project file
5. A new chat reads source files, not the enriched notes
   from the previous chat, unless you uploaded them
6. Weeks later: open the right chat, or re-derive from source
7. Cross-subject context: separate project, not connected
```

**In Ikasio:**
```
1. Paste lecture content
2. Generate notes topic by topic — AI reads the source
   AND prior topics for consistency, saves automatically
3. Ask for an analogy → click "Update Note" → merged
   automatically into the structured note
4. Weeks later: open the subject → AI already reads every
   enriched note as primary context, automatically
5. Studying a second subject? Ask a question that spans
   both — all notes across all subjects are available
   as combined context
```

The difference is not capability — each tool *can* produce enriched notes. The difference is that Ikasio makes the correct workflow automatic, and routes enriched notes back as the AI's primary context across every subject without a single manual step.

---

## 8. Use Case: A Full Semester of Operating Systems

This is the concrete scenario that makes the product's value tangible. It is based on the actual study workflow Ikasio was built to solve.

### The setup

Brian is studying Operating Systems at university. The unit has 6 lectures, each covering multiple topics. Finals are in 6 weeks. He uses Claude to study — pasting lectures in, asking questions, getting explanations — but loses context every time he starts a new chat.

---

### Week 1 — Session 1: Lecture 3, Memory Management

Brian opens Ikasio, creates a subject called *Operating Systems*, and pastes the raw Lecture 3 content.

**He tells the AI:** "Generate notes on Paging first."

Ikasio sends the raw lecture content to the Claude API. The AI produces structured notes on Paging — headings, key facts, a summary. The notes are saved automatically to the database under *Operating Systems → Lecture 3 → Paging*.

**He tells the AI:** "I still don't understand why page size matters. Give me an analogy."

The AI responds with a filing cabinet analogy — fixed-size drawers, documents that fit exactly one drawer regardless of content size. It clicks.

**He clicks "Update Note".**

Ikasio sends the existing Paging note plus the analogy from the chat to the Claude API. The API merges them into one updated, structured note that now includes both the original content and the analogy that worked. Saved automatically.

**He tells the AI:** "Proceed to Free Space Management."

Ikasio sends the raw lecture content *plus the Paging notes already generated* to the API. The AI generates Free Space Management notes in the same style and depth as the Paging notes — consistent, because it read what was already produced.

Session ends. Brian closes Ikasio.

---

### Week 3 — Session 4: Revisiting OS before a new lecture

Brian opens Ikasio and opens *Operating Systems*. He hasn't touched it in two weeks.

**He asks:** "Before we cover scheduling, remind me how paging works and why page size matters."

Ikasio sends all saved OS notes — Paging, Free Space Management, and everything else covered in prior sessions — as primary context. The AI responds:

> "From your notes: paging divides memory into fixed-size blocks. You noted that the filing cabinet analogy worked for you — each drawer holds exactly one document regardless of size. On page size: smaller pages reduce internal fragmentation but increase the page table size. This connects to what we're about to cover in scheduling because..."

It reads the filing cabinet analogy because that analogy is now part of the note — it was merged in Week 1. Brian did not re-explain anything. He did not re-paste anything.

**In NotebookLM or Claude Projects:** Brian would open a new chat. The AI would answer from the raw source PDF. It would not know the filing cabinet analogy clicked for him. It would not know what he still found unclear. It would answer like a textbook, not like a tutor who was there.

---

### Week 5 — Cross-subject session: OS meets Computer Networks

Brian is now also studying Computer Networks. He has generated and enriched notes for both subjects in Ikasio.

**He asks:** "How does OS scheduling relate to network packet scheduling? I know both topics separately but I can't see the connection."

Ikasio sends enriched notes from *both* Operating Systems and Computer Networks as combined context. The AI draws on Brian's own understanding of both subjects simultaneously and explains the connection in terms of what he already knows — the specific analogies and explanations that worked for him in each subject.

**In NotebookLM:** This question is impossible to answer with personal context. OS is in one notebook, Computer Networks is in another. Notebooks are islands. Even if both notebooks have enriched notes, there is no way to ask one question across them. The AI would answer from whichever source PDF it was given.

**In Claude Projects:** The OS project and the Networks project are separate. Cross-project questions are not possible.

---

### Week 6 — Exam preparation

Brian clicks "Generate Practice Questions."

Ikasio sends all OS notes to the Claude API with a prompt to generate 10 exam-style questions and answers grounded in his specific notes. The questions reference the concepts he actually studied, at the depth he actually covered, using the framing he actually understands.

He works through the questions, marks himself correct or incorrect. The progress tree reflects his results — not just time spent, but demonstrated understanding.

---

### What would this look like without Ikasio?

| | Without Ikasio | With Ikasio |
|---|---|---|
| Week 1, after the session | Understanding is buried in one of several chats. At exam time there is no unified view, no clear answer to "which chat do I open?", and no way to query across chats simultaneously. | Structured, merged notes saved automatically to the database — organised by subject and lecture, immediately navigable. |
| Week 3, returning to the subject | Open the right chat, re-read the conversation to find the filing cabinet analogy, re-explain context to a new chat, or re-derive everything from the raw PDF. | Open Ikasio. The AI already knows the analogy. The context is there. |
| Week 5, cross-subject question | Impossible to answer with personal note context from both subjects simultaneously. | One question, one answer, drawn from enriched notes across both subjects. |
| Week 6, practice questions | Manually ask Claude to generate questions, paste your notes in, lose the context when the chat ends. | One button. Questions grounded in your specific notes. Results tracked. |

---

## 9. MVP Feature Scope (3-Week Build)

Everything below is the minimum to validate the core value proposition. Nothing outside this list is in scope for MVP.

### Week 1 — Foundation
- Authentication (sign up / log in via NextAuth.js)
- Subject/unit organisation (sidebar: list of subjects, click to open)
- Simple note editor (TipTap library: headings, bullet points, plain text — not Notion-level, just functional)
- Paste lecture content → AI generates structured notes → notes saved automatically to that subject

### Week 2 — The AI Layer
- AI chat panel within a subject — reads from all saved notes in that subject as context
- **Update Note from Chat** — after enriching understanding through back-and-forth in the chat, one action merges that enrichment into the relevant structured note. The AI takes the existing note plus the chat elaboration and produces an updated, merged note saved automatically. This is the feature that makes the core workflow complete — without it, enrichment stays buried in chat history exactly as it does in other tools.
- **Note Evolution Badge** — each note tracks how many times it has been updated and enriched. A small indicator shows: *"This note has evolved 7 times — Generated → Clarified → Added analogy."* This makes the core product idea immediately tangible to any user or demo viewer: notes don't just get stored, they grow.
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
- Note annotation system
- AI personalisation and learning pattern detection

---

## 10. Future Vision (Post-MVP)

These features are deliberately out of MVP scope but the data model has been designed from Day 1 to support them. They represent a clear, prioritised evolution from note-taking tool to personalised learning memory system — and this roadmap is what gives Ikasio startup potential beyond a portfolio project.

The response to competitive pressure is not more features. It is a deeper moat. Large platforms can copy note generation, chat, and timers. What they cannot easily copy is a personalised learning history that has accumulated for months — specific to how one student thinks, what analogies work for them, and what they keep forgetting.

---

### Version 2 — Knowledge Gaps + What Worked For Me

**Priority: Build first after MVP. Data already exists in the schema.**

**Knowledge Gaps**

Every time a user signals confusion — "I don't understand", "explain again", "still confused", "can you simplify" — store it in `ChatMessage.metadata`. Then surface it:

```
Knowledge Gaps

Operating Systems
- Thrashing (asked 4 times)
- Working Set Model (asked 3 times)

Computer Networks
- Bellman-Ford Count to Infinity (asked 2 times)
```

Now the AI knows what the student struggles with. This transforms the product from "AI note-taking app" to "AI that understands what I don't understand." That is a fundamentally more compelling story.

**What Worked For Me**

Every time an analogy clicks, store it in `NoteAnnotation` with type `analogy_worked`:

```
Paging        → Filing cabinet analogy worked
Deadlocks     → Traffic intersection analogy worked
Virtual Memory → Hotel room analogy worked
```

Future explanations automatically reuse what worked:

> "Since the filing cabinet analogy helped you understand paging, let's extend that analogy to explain TLB..."

That is genuinely personalised. Both models — `ChatMessage.metadata` and `NoteAnnotation` — are already in the schema. This version requires no migration. It requires building the UI and the logic on top of data that has been collecting since Day 11.

---

### Version 3 — AI Revision Coach + Understanding Timeline

**Priority: Build after Version 2 is validated.**

**AI Revision Coach**

Instead of waiting for the student to ask:

```
You haven't reviewed Paging in 18 days.

Quick question: Why does paging eliminate external fragmentation?
```

This directly attacks forgetting — the highest-pain problem identified in external reviews. Students don't fail because they lack notes. They fail because they forget. This feature requires a background job system for scheduled reminders.

**Understanding Timeline**

```
Paging

June 1:  ❌ Confused
June 3:  ⚠️ Partially understood
June 7:  ✅ Demonstrated understanding
```

Progress that measures learning, not time. Built on `PracticeQuestion.correct` which is already in the schema.

---

### Version 4 — Ask From My Perspective / Semester Memory

**Priority: Build after Version 3 is validated. Requires significant data accumulation first.**

The system learns that a specific student prefers analogies, asks many "why" questions, struggles with abstract definitions, and tends to understand things step by step. Every explanation is then automatically personalised:

> "Explain deadlock the way Brian usually understands things."

This is the hardest feature for a large platform to copy — it requires months of accumulated, user-specific learning history. It is also the feature that, once it exists, makes the product feel irreplaceable.

---

### The honest startup trajectory

MVP validates: *do students care that the AI reads their notes instead of the source PDF?*

Version 2 validates: *do students find it valuable that the AI knows what they struggle with?*

Version 3 validates: *does proactive revision reduce forgetting enough to matter?*

Version 4 creates: *a personalised learning companion that compounds value over an entire degree.*

The moat is not any single feature. It is the accumulated personal learning history that makes Ikasio increasingly valuable the longer a student uses it — and impossible to replicate even if competitors copy every individual feature.

---

## 11. The Value Proposition

**One sentence:**
> Other tools store your understanding in conversations. Ikasio turns that understanding into structured knowledge that compounds over time.

**For students:**
> You never lose an explanation that finally made something click. Every clarification automatically becomes part of your notes — and the AI reads those notes, not the textbook, every time you come back.

**The stronger angle — active retrieval, not passive re-reading:**
> Ikasio is an AI study companion that remembers exactly what you don't understand and what worked for you. It doesn't just help you take notes — it makes you retrieve and test yourself against your own understanding. From your first session, it silently tracks where you ask for clarification and what analogies clicked — and in Version 2, the AI surfaces those gaps and reuses what worked automatically.

**For interviewers and recruiters:**
> Ikasio identified the specific gap that NotebookLM, Claude Projects, RemNote, and Notion all miss — enriched understanding from back-and-forth AI conversation gets buried in chat history and never becomes structured, retrievable knowledge. Ikasio closes that gap automatically, and is the only tool that merges chat elaborations back into canonical notes with a visible evolution history and lets you query across subjects simultaneously.

---

## 12. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 with TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js |
| Database | PostgreSQL (via Prisma ORM) |
| Note Editor | TipTap |
| AI | Claude API (claude-sonnet-4-6) |
| Deployment | Vercel (frontend) + Supabase (database) |

All of this is within the existing skill set. No new languages or frameworks required.
