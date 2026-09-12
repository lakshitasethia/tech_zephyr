# Life RPG — Pre-Build Research

**Purpose:** Establish (1) exactly what the hackathon spec obligates us to build, (2) what the existing gamified-productivity market already does, and (3) where the genuine, defensible gaps are — so that Life RPG is not "yet another XP/streak tracker."

**Date compiled:** 2026-09-12
**Status:** Research only. No design or implementation decisions are final until reviewed.

---

## 1. Hackathon Requirements Summary

Extracted from `requirements.txt` (the organizers' official problem statement). Quoted verbatim where the wording carries a constraint.

### 1.1 The Core Problem (framing)

> "Traditional productivity tools, habit trackers, and to-do lists are fundamentally flawed for many users: they feel like chores. They suffer from a 'delayed gratification' problem... In contrast, video games provide immediate dopamine through instant feedback loops, clear progression systems, and tangible rewards."

> "Unlike a simple frontend prototype, this project requires a robust full-stack architecture. It needs a secure backend to prevent users from easily 'cheating' their stats, a relational or document database to maintain complex historical logs of completed tasks and inventory, and user authentication to allow seamless cross-device synchronization."

**Three hard architectural implications** (these are stated, not inferred):
- Secure backend — **anti-cheat is an explicit requirement.** XP/level math must be computed and validated server-side.
- A database maintaining **"complex historical logs of completed tasks and inventory"** — not just current state. History is required.
- Auth for **cross-device synchronization.**

### 1.2 Product Feel & Creative Direction

> "This application should not look or feel like a standard enterprise SaaS dashboard or a generic Bootstrap CRUD app. It needs a soul. You have complete creative freedom over the thematic execution—whether you build a cozy lo-fi study room, a 16-bit retro dungeon crawler, a sleek cyberpunk interface, or a minimalist modern dashboard."

Regardless of theme, the app must feel:
- **"Alive and Tactile":** "The UI should react instantly to the user. Earning Experience Points (XP), leveling up, or buying an item should feel celebratory. Use CSS micro-interactions, spring animations, or subtle particle effects to make mundane checkmarks deeply satisfying."
- **"Thematically Cohesive":** "If you choose a fantasy theme, your typography, color palette, and language (e.g., 'Quests' instead of 'Tasks', 'Gold' instead of 'Points') should match. Establish a strong visual hierarchy so the screen doesn't become cluttered with stats."
- **"Seamlessly Integrated":** "the user should never feel bogged down by network latency. Utilize loading skeletons, optimistic UI updates, and smooth transitions so the experience feels as fast as a native client-side app."

### 1.3 Allowed Technology Pool

- **Frontend / UI:** React, Vue, Svelte, Angular, SolidJS, HTML/CSS/JS. (Tailwind, SCSS, Radix, Shadcn, Framer Motion, GSAP, etc.)
- **Backend / API:** Node.js (Express/Nest), Python (Django/FastAPI), Go, Ruby on Rails, Java (Spring), Next.js API Routes, or SvelteKit endpoints.
- **Database (Relational or NoSQL):** PostgreSQL, MongoDB, MySQL, SQLite, Redis.
- **BaaS / Auth:** Firebase, Supabase, Appwrite, Clerk, NextAuth, or custom JWT/Session implementations.

> "You may freely mix and match... You are encouraged to use whatever full-stack architecture you are most comfortable with."

### 1.4 Required Deliverables (all three mandatory)

1. **Public GitHub Repository** — "Must contain all source code (frontend and backend), a clean commit history, and a detailed README.md containing setup instructions and environment variable templates (`.env.example`)."
2. **Live Deployed URL** — "A fully functioning, publicly accessible live link (e.g., hosted via Vercel, Netlify, Render, Railway, Heroku, or AWS)."
3. **Illustration Video** — "A screen recording (under 100MB, strictly 90–180 seconds) demonstrating user signup/login, adding/completing a task, the leveling up process, and a page refresh to prove database persistence. Must be hosted in the repo or via an accessible public link."

### 1.5 Core Features Checklist (mandatory systems)

> "To give you creative freedom, we are not dictating the exact math or specific items. However, your application must successfully implement the following core systems:"

- **User Authentication & Security:** "Secure signup, login, and session management. A user should only see and modify their own tasks and character data."
- **Database Schema & CRUD:** "A thoughtfully designed database structure to handle Users, Tasks, and character attributes. Users must be able to Create, Read, Update, and Delete tasks smoothly."
- **The RPG Progression Engine:** "Implement a non-linear leveling system (where each subsequent level requires more XP than the last)."
- **Gamified Elements:**
  - **Streaks:** "A system that tracks consecutive days of activity."
  - **Attributes:** "Categorize tasks so they level up specific character stats (e.g., Coding increases 'Intellect', Gym increases 'Strength')."
  - **Rewards/Economy:** "A system where users earn currency or points to 'buy' virtual items, themes, or profile badges."
- **Responsive & Accessible UI:** "The app must be fully responsive (mobile to desktop screens), entirely navigable via keyboard (Tab, Enter, Space), and structurally sound for screen readers."

### 1.6 Disqualification Rules (Zero-Tolerance — immediate zero)

| Rule | Description |
|---|---|
| **Broken Links** | The GitHub repo is private, or the live deployment link is broken/inaccessible at the time of judging. |
| **Fake Data Persistence** | "The application relies solely on localStorage for primary data. If user data does not persist [server-side]." |
| **Build/Deployment Failure** | "The live app crashes on load, or the backend API fails to connect to the database in the production [environment]." |
| **Console/Runtime Crashes** | "Unhandled runtime exceptions or blank-screen crashes occur during basic application usage." |
| **Invalid Repository** | "The repo contains fewer than 3 chronological commits, lacks the backend code, or shows evid[ence of ...]" (text truncated in source file) |
| **Missing/Restricted Video** | "The walkthrough video is omitted, requires login authorization to view, or exceeds the 100MB [limit]." |

> ⚠️ **Note:** three of these rows are truncated mid-sentence in `requirements.txt` itself (Broken Links, Build/Deployment Failure, Invalid Repository, Missing/Restricted Video). The intent is unambiguous but we should confirm the full text with organizers if possible. In particular "shows evid[ence]..." most likely refers to evidence of a single bulk commit / code dumping.

**Operational consequences for us:**
- ≥ 3 chronological, meaningful commits. No single "initial commit" dump. *(This research commit is commit #1.)*
- No localStorage as the source of truth. localStorage may only be used as an optimistic cache in front of the server.
- Production DB connection must be verified live, not just locally.
- Global error boundaries + graceful API failure handling are **disqualification-level**, not polish.
- Video must be 90–180 seconds, <100MB, no login wall.

### 1.7 Judging Criteria

- **Design & UX (flagged "Crucial Warning"):** "The visual appeal and user experience are major factors. Submissions with lazy, overly generic designs, default unstyled components, or poor visual hierarchy will fetch significantly lower marks. We are looking for polish, creativity, and a cohesive theme."
- **Performance & SEO:** "Fast load times, optimized assets, responsive performance across devices, semantic HTML, accessible structure, and SEO-friendly metadata/content."
- **Creativity & Gamification:** "How creatively have you implemented the RPG elements? Does the progression system feel rewarding and well-thought-out, or does it feel like an afterthought?"
- **Robustness & Edge Cases:** "Does the app handle errors gracefully? What happens if a user submits an empty task, or their internet connection drops?"
- **Accessibility & Responsiveness:** "Does the application work flawlessly on mobile devices? Can it be navigated via keyboard?"

**Reading between the lines:** "Creativity & Gamification" is a named judging pillar and the spec explicitly warns against gamification that "feels like an afterthought." A submission that implements only the 1.5 checklist scores baseline on the single pillar that most differentiates submissions. That is the entire argument for Sections 3 and 4 of this document.

---

## 2. Competitive Landscape

One subsection per app. "Signature mechanic" means the thing that is *not* XP/levels/streaks.

### 2.1 Habitica

- **Site:** https://habitica.com · **Wikipedia:** https://en.wikipedia.org/wiki/Habitica · **Wiki:** https://habitica.fandom.com/wiki/Death_Mechanics
- **Core progression:** XP + Levels + Gold + class system (Warrior/Mage/Healer/Rogue) with allocatable stat points. Habits / Dailies / To-Dos as three distinct task types.
- **Signature mechanic: shared-fate party damage.** You join a Party; when *any* member misses their Dailies during a Quest, the boss damages **the whole party**. Death is real: you lose one Level, all XP toward the next Level, one random allocated Stat Point, and one random piece of Equipment.
- **Praise:** Deep, genuinely game-like; the three-task-type taxonomy (Habit vs. Daily vs. To-Do) is the best-designed part of the whole market and everyone else has copied a weaker version of it. Strong social layer, active open-source community, no dark-pattern monetization.
- **Complaints:**
  - **Damage attribution is opaque.** An open GitHub issue (#15268, "Make messaging more clear when you're taking damage due to quest boss after party member checks in") documents that users routinely "run out of HP out of nowhere" and cannot tell why. This is a *failure of feedback legibility*, not of the mechanic itself — a critical lesson for us.
  - **Overwhelming onboarding / busy UI.** Repeatedly cited: the gamified system and feature surface is too much for new users; managing tasks, rewards, and in-game elements "can become time-consuming, reducing the time available for actually completing tasks." The meta-game competes with the actual work.
  - Complexity, excessive notifications, weak offline support.
  - Yu-kai Chou's Octalysis review flags design flaws in "spam mechanics, social onboarding, and long-term engagement loops" — i.e. checking boxes you didn't earn is trivially easy, so the economy inflates.
- **Visual style:** 16-bit-adjacent pixel art avatars and equipment, high-saturation purple/lavender chrome, dense multi-column task board. Notably, GitHub issue #361 ("Interface Style & Aesthetics") captures the long-standing critique that **the chrome/UI never rose to the quality of the pixel art** — the art is charming, the surrounding interface is generic. Underwent a large redesign in Sept 2017. https://github.com/HabitRPG/habitica/issues/361

### 2.2 Finch — Self-Care Pet

- **App Store:** https://apps.apple.com/app/id1528595748 · **Review:** https://www.autonomous.ai/ourblog/finch-self-care-app-review-full-breakdown
- **Core progression:** Your bird's growth stages + "Rainbow Stones" currency + energy. Progression belongs to the *pet*, not to an abstract stat block.
- **Signature mechanic: care-based, strictly punishment-free progression.** You complete small self-care actions and the bird goes on an adventure and grows. **"If you skip a day, nothing bad happens."** The emotional hook is nurturing an entity that is happy to see you, not optimizing a character sheet.
- **Praise:** Extremely strong with **neurodivergent users** — repeated reports that people stick with Finch when nothing else took, because "doing self-care *for the bird* feels lighter than traditional journaling." Displacing the obligation onto a character lowers the activation cost. No ads.
- **Complaints:** Dense first-run interface (too much shown at once on day one); iOS/Android feature and price gap; subscription pricing. Notably, criticisms are about **onboarding and pricing, not the core loop** — the loop itself is the most-validated design in this whole list.
- **Visual style:** Soft pastel gradients, rounded geometry, hand-drawn 2D bird with expressive idle animation, generous whitespace, warm off-white grounds. The friendliest-feeling app in the category.

### 2.3 LifeUp

- **Play Store:** https://play.google.com/store/apps/details?id=net.sarasarasa.lifeup · **Site:** https://www.lifeupapp.fun/en/index.html
- **Core progression:** XP, level, coins, user-defined **attributes**, achievements, shop, inventory.
- **Signature mechanic: it's a sandbox, not a game.** LifeUp ships with almost no authored content — "not a set of quests or experience rules... created as a sandbox where you create abilities, rewards, currencies, and even mini-games." You author your own attribute taxonomy and reward economy.
- **Praise:** Total customization; clean Material Design; **one-time purchase, no ads, no subscription**; offline-first (all data on device).
- **Complaints / tradeoffs:** The sandbox is the weakness as well as the strength — a blank canvas has a high setup cost and no authored narrative pull, so it rewards the already-motivated. **Android only**, and offline-local storage means no real cross-device story. (Note: offline-first would be an *automatic disqualification* under our spec's Fake Data Persistence rule — a useful reminder that a great product can be a failing submission.)
- **Visual style:** Material Design 3, clean, theme-color options, dark theme. Competent and unobtrusive; not a strong aesthetic identity.

### 2.4 TaskHero

- **Site:** https://taskhero.app/ · **App Store:** https://apps.apple.com/us/app/taskhero/id1480746112 · **Play:** https://play.google.com/store/apps/details?id=com.whetware.taskhero
- **Core progression:** RPG adventurer avatar, XP/levels, gear, plus tasks/habits/reminders/lists/scheduling/focus timers in one app.
- **Signature mechanic: your checkmarks are literally combat inputs.** You fight monsters in "Tasklandia" — "checking off tasks is literally how you hit monsters during battle." Plus guilds and parties.
- **Praise:** Rated ~4.68/5 (small n, 42 ratings). Reviewers who have used Habitica are emphatic: "this blows them all away and it's not even close" and "the best integration of tasks and RPG elements." The praise consistently centres on the **tightness of the task→combat coupling** — the game reacts *at the moment* of the checkmark. Users report "looking for more to do," i.e. successfully induced task-seeking.
- **Complaints:** Small review base; less mature social ecosystem than Habitica; deep RPG framing is not for everyone. Reviews are thin enough that I'd treat the ratings as directional only, not evidence.
- **Visual style:** Illustrated cartoon-fantasy (not pixel art), warm palette, character/monster art with combat-feedback animation on task completion.

### 2.5 MainQuest

- **Site:** https://www.mainquest.net/ · **Features:** https://www.mainquest.net/features
- **Core progression:** Quests, character stats, non-linear leveling, loot/gear/avatar, habits with streak bonuses.
- **Signature mechanic: HP damage + a Mana "spell" mitigation layer, plus boss battles as multi-step project encounters.** "You earn XP for completing tasks, level a character, build streaks, take HP damage when you fall behind, **cast Mana spells to protect progress**, and complete focus sessions for bonus XP." Boss battles "turn large projects into multi-step encounters."
- **Praise / positioning:** Explicitly self-marketed as **ADHD-designed**; free across Android, iOS and Web with cross-device sync; integrated Pomodoro that pays XP.
- **Complaints:** ⚠️ **Honest caveat — nearly every high-ranking search result about MainQuest is published on mainquest.net's own SEO blog**, including their "objective" comparison articles ("MainQuest vs Habitica," "Best Gamified To-Do List Apps 2026," "Habitica Alternatives"). Their claim that "true gamification... includes HP damage for missed tasks, boss battle mechanics" is *marketing positioning, not a research finding*. I could find no substantial independent review corpus. Treat MainQuest's feature list as a real competitive signal and their claims about efficacy as unverified.
- **Visual style:** Modern flat-illustrated dark UI, purple/indigo accents, card-based quest lists. Contemporary web-app feel rather than retro.
- **Why they matter most to us:** MainQuest is the **closest existing product to the obvious "ambitious Life RPG" design.** HP + boss battles + focus timer + ADHD framing is *already shipped*. Anything we build in that space is a recombination, not a novelty. This is the single most important finding in Section 2.

### 2.6 KUBBO

- **Site:** https://kubbo.app/ · **Features:** https://kubbo.app/features · **App Store:** https://apps.apple.com/us/app/kubbo-goal-tracker/id6749530918
- **Core progression:** XP + Gold + medieval character levels + achievements.
- **Signature mechanic: spatial, cumulative city-building.** "Every finished task isn't just a checkmark. It's a new building, a park, a landmark in your growing digital metropolis." Gold buys towers, walls, paths, decorations.
- **Praise:** The metaphor solves a real problem — a number going up is forgettable, **a skyline is a legible, glanceable, screenshot-able record of months of work.** Free, cross-platform (iOS, iPad, Android, Mac, Vision).
- **Complaints:** Young app, thin independent review base. Structural risk with all builder metaphors: the city becomes *saturated* — once it's full and pretty, marginal buildings stop meaning anything, and there's no natural difficulty curve to reset against.
- **Visual style:** Charming low-poly / isometric medieval 3D-ish blocks, soft lighting, playful. The most visually distinctive app in this list after Finch.

### 2.7 Dendedo

- **Site:** https://www.dendedo.com/
- **Core progression:** AI-generated daily step ladder toward one goal, with light gamification.
- **Signature mechanic: enforced singularity of focus.** "Focuses on one goal at a time by design." An AI planner decomposes the goal into small daily steps. Aimed at "people whose one big goal keeps not happening."
- **Praise:** The anti-feature *is* the feature. Every other app in this list encourages accumulating a task backlog; Dendedo says a backlog is the disease. AI decomposition removes the planning step, which is where most goals die.
- **Complaints:** iPhone only. Steep subscription ($14.99/mo or $59.99/yr after a 7-day trial). By their own admission "the wrong tool if you need to manage dozens of unrelated tasks, projects at work, or a shared team list" — so it can't be anyone's only productivity app, which is a hard commercial ceiling.
- **Visual style:** Clean modern minimal iOS; calm, low-chrome, single-focus screens.

### 2.8 Forest

- **Site:** https://forestapp.cc/
- **Core progression:** Coins from focus sessions; a growing forest of trees, one per session.
- **Signature mechanic: destructive loss + real-world stakes.** Leave the app during a session and **your tree dies** — a visible, permanent scar in your forest. Separately, in-app coins can be spent to fund **real trees planted** via Trees for the Future. 60M+ users since 2014.
- **Praise:** "The most distinctive view is your visible forest — every focused session as a tree, your time made visible at a glance." The real-tree tie-in converts a virtual economy into genuine external meaning, which almost nothing else in this category attempts.
- **Complaints (well documented, and directly relevant to us):**
  - **It's a timer, not a tracker.** "Forest is a timer that doesn't track daily habits, tasks, or routines, requiring a second app."
  - **Reward habituation.** "Points and streaks lose power once the reward system feels predictable, and Forest doesn't have a great answer for it." Multiple long-term users report **the tree mechanic loses its charm after a few months.** This is the single best-documented failure mode in the whole category.
  - Free competitor Flora bundles timer + to-dos + habits + group sessions.
- **Visual style:** Flat vector botanical illustration, muted greens/earth tones, calm. Widely imitated for good reason.

### 2.9 EpicWin

- **Historical:** https://alternativeto.net/software/epic-win/ · https://www.webmaster-source.com/2010/08/23/epicwin-a-to-do-list-app-with-an-rpg-theme/
- **Core progression:** Create a character, level up by completing self-assigned tasks; loot drops.
- **Signature mechanic:** Effectively the *original* (2010) RPG to-do list, and the one that leaned hardest into **character-as-avatar-on-a-journey** with strong illustrated loot and comedic writing.
- **Status:** ⚠️ **Effectively dead.** Android last updated 2015-12-26; developer Supermono Studios / acquirer Red Robot Labs dormant since ~2013.
- **Why it's still worth studying:** EpicWin is the category's cautionary tale — a beautifully art-directed, charming, well-reviewed RPG to-do list that *did not survive*. Its failure suggests that **novelty of theme alone does not retain users**; without a sustaining loop (social, evolving content, or real stakes) the joke wears out. Directly corroborates the Forest habituation finding.
- **Visual style:** Hand-illustrated fantasy caricature, chunky wooden UI, comic tone. Charming, of its era.

### 2.10 Streaks (iOS)

- **App Store:** https://apps.apple.com/us/app/streaks/id963034692 · **Review:** https://calmevo.com/streaks-app-review/ · https://thesweetsetup.com/apps/best-habit-tracking-app-ios/
- **Core progression:** Consecutive-day counts. That's it. **No RPG layer at all.**
- **Signature mechanic: aggressive subtraction.** "No RPG characters, no databases to build, no recurring subscriptions. Just you, your habits, and a satisfying daily check-in that takes thirty seconds." Up to 24 habits shown as a grid of large press-and-hold buttons.
- **Praise:** **Apple Design Award winner.** "The visual design of this grid is genuinely one of the most satisfying interfaces in any productivity app." Best-in-class widgets. The press-and-hold-to-complete gesture with haptic + ring-fill animation is the most-copied interaction in the category.
- **Complaints:** Deliberately shallow — no projects, no dependencies, no social; iOS-only; caps at 24 habits.
- **Visual style:** Bold flat iconography, high-contrast color-coded tiles, huge tap targets, ring-fill animation. **This is our single best reference for tactile completion feedback**, which the spec explicitly demands ("make mundane checkmarks deeply satisfying").
- **The uncomfortable lesson:** the most *design-awarded* app in this list is the one with the *least* gamification. Complexity is not the same as quality. Our differentiators must each earn their screen space.

### 2.11 Notion-based gamified systems

Notion has **no native gamification** — no XP engine, no timers, no state machine. Every "gamified Notion system" is a hand-built simulation using databases, rollups, formulas, and (recently) automations.

Representative examples:
- **Gamified Task Manager – RPG Style** (Hansel Systems) — https://www.notion.com/templates/gamified-task — to-dos carry XP values which roll up into levels.
- **Gamified Life OS** — https://notiondone.com/product/gamified-life-os/ and https://gamifiedlifeos.com/ (Solo Leveling–themed) — XP, skill leveling, habits, goals, finances, an analytics dashboard of "RPG journey," achievement badges, documented level-ups.
- **LiFE RPG (Notion)** — https://www.liferpg.site/ — PARA method (Projects/Areas/Resources/Archives) fused with XP and rewards. ⚠️ **Direct name collision with our project — worth knowing before we brand anything.**
- Roundups: https://www.solt.ws/blog/top-10-notion-gamification-templates-to-gamify-your-life · https://pathpages.com/blog/gamification-notion-template · https://ducktemplates.com/products/gamify-your-life-notion-template

**Recurring pattern across templates:** player profile with stats · "grow" modules for habits in progress · quest systems breaking big goals into milestones · a daily log framed as an adventure journal · a coin economy + reward shop · XP progress bars.

**Honest read on why people buy these anyway:**
- They want gamification **inside the system where their real work already lives.** No standalone RPG app can integrate with someone's existing notes, projects, and databases. This is a genuine, structural advantage that no dedicated app can beat head-on.
- Total customizability of the XP formula and reward taxonomy.

**And why they're structurally weak — this is our opening:**
- **Everything is manual.** You type "50" into an XP field. There is no server, no validation, no anti-cheat. It is a spreadsheet with a costume, and everyone using one knows it — which quietly drains the meaning from every number in it.
- **No juice.** A Notion rollup cannot pop, shake, particle-burst, or play a level-up fanfare. Notion cannot do the *one thing* our spec explicitly demands ("celebratory," "spring animations," "particle effects"). The whole appeal of gamification is the feedback moment, and Notion structurally cannot deliver it.
- **High setup cost, high abandonment.** These are elaborate systems that require maintenance; maintaining the tracker becomes the procrastination.

---

## 3. Gap Analysis

### 3.1 Saturated — table stakes, zero differentiation value

Present in essentially every product surveyed. We must build these (the spec requires them) but must not *market* on them:

| Mechanic | Who has it |
|---|---|
| XP + non-linear levels | Habitica, LifeUp, TaskHero, MainQuest, KUBBO, EpicWin, every Notion template |
| Consecutive-day streaks | All of them; Streaks is nothing but this |
| Character attributes / stats | Habitica, LifeUp, TaskHero, MainQuest, Notion templates |
| Currency + cosmetic shop | Habitica, LifeUp, KUBBO, MainQuest, Forest |
| Avatar / gear customization | Habitica, TaskHero, MainQuest, EpicWin |
| Pomodoro/focus timer earning XP | MainQuest, Forest, TaskHero, Flora |
| Parties / guilds / co-op | Habitica, TaskHero, MainQuest |
| HP damage for missed tasks | Habitica, MainQuest |
| Boss battles for big projects | TaskHero, MainQuest |
| Pet/companion growth | Finch, Forest (trees), Focumon |
| AI task breakdown | Dendedo, and increasingly everywhere |

⚠️ **This table is the most important thing in the document.** Several ideas from the original brainstorm brief — boss battles for big projects, HP loss for missed tasks, a companion tied to consistency, AI task breakdown, guilds/leaderboards — **are already shipped by MainQuest, TaskHero, Habitica, Finch and Dendedo respectively.** They are all reasonable to build. None of them is a differentiator on its own, and claiming otherwise to a judge who has used Habitica would hurt us.

### 3.2 The three failure modes nobody in this market has solved

Synthesized across the reviews above. Each is a real, documented, unfixed problem — and each is a place to actually win.

**(A) Reward habituation — "the gamification wears off after ~2 months."**
Directly documented for Forest ("several long-term users reporting that the tree mechanic loses its charm after a few months"; "points and streaks lose power once the reward system feels predictable, and Forest doesn't have a great answer for it") and demonstrated by EpicWin's death. Every app in this list has a **static reward function**: the same task pays the same XP on day 1 and day 300. Games do not work this way — real RPGs constantly retune difficulty, introduce new systems on a schedule, and make old content trivially easy so you *feel* your growth. **No productivity app models the fact that a task that was hard in January is easy in June.**

**(B) Economy inflation / no anti-cheat — "the numbers don't mean anything."**
Habitica's Octalysis review names "spam mechanics" outright; Notion templates are self-scored by definition; LifeUp lets you author your own rewards. If you can mark "Read for 30 minutes" complete without reading for 30 minutes, and you set the XP value yourself, then your level is a number you chose. **Our spec makes server-side anti-cheat mandatory — the market treats this as an afterthought, and we can treat it as a feature.** Legitimacy is a mechanic.

**(C) Illegible feedback — "why did that happen to me?"**
Habitica issue #15268 is the cleanest example: users lose HP and cannot tell why. This is precisely the case where a negative mechanic flips from motivating to alienating. The lesson generalizes: **any consequence the user cannot trace to a cause is experienced as unfairness, not challenge.**

### 3.3 The punishment-vs-reward question, answered honestly

This deserves care because the brief specifically asked, and because the popular answer is half-wrong.

**What the evidence supports:**
- Prospect Theory (Kahneman & Tversky): losses register roughly **2× more strongly** than equivalent gains. This is robust and not in dispute.
- Aggregated industry reporting claims apps leveraging loss aversion see ~**35% higher DAU** than points-only apps, and gamified apps ~**47% higher 90-day retention** than non-gamified. (https://www.digia.tech/post/gamification-mobile-apps-streaks-rewards-retention/, https://www.strivecloud.io/blog/10-ways-to-drive-engagement)
- Duolingo's streak team: users with 7+ day streaks retain at **2.4×** the rate of users who never establish one; a streak *wager* produced a **+14% day-14 retention** lift. (https://www.getrecall.ai/summary/lennys-podcast/behind-the-product-duolingo-streaks-or-jackson-shuttleworth-group-pm-retention-team)
- Commitment contracts with real stakes: a BMJ RCT found ~**50%** of commitment-contract users hit their weight-loss goal vs ~**10%** of controls; stickK reports users are ~3× more likely to achieve staked goals. (https://stickk.zendesk.com/hc/en-us/articles/206833157-How-it-Works)

**⚠️ Caveats I want on the record.** The 35%/47% figures come from marketing blogs by gamification vendors, not peer-reviewed work — they are directionally plausible and commercially motivated. The Duolingo numbers come from a PM interview, not a published study. The BMJ RCT is real and strong but is about *financial* stakes in *weight loss*, which may not transfer to virtual HP in a to-do app. **Nobody should cite these as settled science, including us.**

**The counter-evidence, which matters more than the headline:**
- The most important paper here is literally titled *"Gaining Reward vs. Avoiding Loss: When Does Gamification Stop Being Fun?"* (https://www.researchgate.net/publication/281176420) — the framing is that loss mechanics have a **breaking point**.
- Habitica's death penalty (lose a level, XP, a stat point, and random equipment) combined with unexplained party damage is the most-complained-about thing about Habitica.
- **Finch retains extremely well with a strictly zero-punishment design** — "if you skip a day, nothing bad happens" — and is specifically the app that *works for people other apps failed*, notably ADHD/anxiety users. This is the single strongest counterexample and it should stop us from over-indexing on loss aversion.
- Duolingo's own most successful retention intervention was **Streak Freeze — a mechanic that *removes* punishment.** It cut churn ~21% for at-risk users and works by "removing the catastrophic failure state that causes abandonment, without eliminating the daily pressure." Giving new users two free freezes was one of their biggest wins.
- Documented pathology: **streak protection displaces the actual goal.** "Users are motivated to maintain streaks at the cost of careful engagement. Speed-running an easy lesson to protect a streak activates the retention mechanism without the learning." A productivity app that induces fake task completion has *inverted its own purpose.*

**Conclusion — the tradeoff, stated plainly:**

> Loss aversion measurably increases engagement, and it increases it most for users who are already coping well. It is actively harmful for the anxious, depressed, burned-out, and ADHD users who most need a habit tool — the exact population Finch wins by refusing to punish. And punishment mechanics reliably corrupt the metric: threaten the streak hard enough and the user protects the streak instead of doing the work.
>
> The correct design is not "punish" or "don't punish." It is: **make decay legible, gradual, reversible, and user-consented; never make it a surprise; and always leave a recovery path.** Loss of *momentum* (a decaying multiplier you can rebuild) rather than loss of *earned progress* (a level you already worked for) captures the retention benefit without the catastrophic failure state. That is exactly what Streak Freeze does, and Duolingo has the numbers.

**Concrete implication for us:** default to warm/forgiving. Make harsh consequences **opt-in per user** ("Hardcore Mode"), never the default. That is a defensible design position, it's honest, and it's a good thing to be able to say out loud to a judge.

### 3.4 Genuinely underexplored space

- **Time-shape and scheduling depth.** Almost every RPG-gamified app models a task as a binary flag with an optional due date. Almost none model start dates, effort estimates, dependency chains, or a calendar view — even though *deadline proximity is the most naturally game-like variable in real life* and nobody is using it as a difficulty curve. (Dendedo is the closest with AI daily-step ladders.) This is under-built because it's unglamorous, not because it's low-value.
- **Difficulty that adapts to demonstrated ability.** See 3.2(A). Nobody does it.
- **Verification / legitimacy as a mechanic.** See 3.2(B). Nobody does it.
- **Retrospection.** Every app is a forward-facing to-do surface. KUBBO's city is the only mechanic in the whole survey that produces a *lasting, glanceable artifact of the past*, and it's spatial rather than temporal. Nobody turns your history into something worth revisiting — despite our spec explicitly requiring "complex historical logs."
- **Cost-of-context-switching.** Every app rewards *volume* of completed tasks. None models the very real cost of scattering attention across ten unrelated things, or rewards coherent focus on one thread. (Dendedo enforces single-focus but doesn't reward it as a mechanic.)

---

## 4. Recommended Feature Set for Life RPG

### 4.1 Required (from spec — non-negotiable)

| # | Feature | Notes for implementation |
|---|---|---|
| R1 | Secure auth: signup, login, session management | Row-level ownership enforced server-side. Spec: "A user should only see and modify their own tasks and character data." |
| R2 | DB schema: Users, Tasks, character attributes, **historical logs**, inventory | Spec explicitly requires *historical* completion logs and inventory, not just current state. Design for an append-only event log from day one — several differentiators below depend on it. |
| R3 | Full CRUD on tasks | Including edit and delete, "smoothly." |
| R4 | Non-linear leveling engine | Each level costs more than the last. **Computed server-side** (anti-cheat is an explicit spec requirement). |
| R5 | Streaks | Consecutive days of activity. |
| R6 | Attributes | Task categories map to character stats (Coding→Intellect, Gym→Strength). |
| R7 | Rewards economy | Earn currency, spend on items/themes/badges. |
| R8 | Responsive + keyboard-navigable + screen-reader-sound UI | Tab/Enter/Space fully operable. This is both a checklist item *and* a judging pillar. |
| R9 | Tactile, celebratory, thematically cohesive UI with optimistic updates + skeletons | "Crucial Warning" judging pillar. Highest marginal score per hour of effort. |
| R10 | Public repo, ≥3 chronological commits, README + `.env.example`, live URL, 90–180s video | Disqualification-level. |

### 4.2 Differentiating (our additions)

Ordered by *(differentiation × feasibility) ÷ risk*. Each cites the research finding it answers.

---

**D1 — Adaptive Difficulty / Mastery Decay ("the task that was hard in January is easy in June")**
*Novel — I found no product doing this.*

Each task category tracks a personal **mastery curve** from the historical log. As you complete "Gym" 40 times, Gym tasks pay progressively less XP — the system has *seen you do this* and it isn't impressive anymore. To keep earning, you must escalate (longer, harder, a new variant), and the app surfaces the escalation as a prompt: *"Gym is mastered. Ready to raise the stakes?"* Conversely, categories you've neglected accrue a **rustiness bonus** and pay more, pulling you back.

- **Why:** directly answers Gap 3.2(A), the best-documented failure in the category — Forest's "gamification wears off," EpicWin's death. Every competitor has a static reward function; a self-retuning one is a real answer to habituation.
- **Fit:** requires exactly the historical log the spec already mandates (R2). It is a server-side computation, which reinforces the anti-cheat requirement rather than fighting it.
- **Tradeoff, honestly:** diminishing returns can read as *punishing consistency* — the exact opposite of what a habit app should do. Mitigation: never let a mastered task pay *zero*; convert it to a small, dignified "Maintenance" yield plus a visible **Mastery rank** on that attribute. The user should feel promoted, not taxed. This needs careful copy or it will feel awful.

---

**D2 — Verified Effort / Legitimacy as a Mechanic**
*Novel in this market.*

The spec demands anti-cheat. Make it visible instead of hiding it. Every completion carries a **provenance tier**: self-reported (fast, always allowed) vs. **verified** (completed inside a focus session the server timed, or checked off within the window you scheduled it for, or photo/note-attested). Verified completions pay a premium and are the *only* ones that count toward Mastery ranks and prestige cosmetics. Your profile shows an honest **Integrity ratio.**

- **Why:** answers Gap 3.2(B). Habitica's own Octalysis review names "spam mechanics"; Notion templates are self-scored fiction. In every competitor, a high level proves nothing, and users know it — which is precisely why the numbers stop mattering. Making legitimacy earnable makes the number mean something again.
- **Fit:** it is literally the spec's stated reason for requiring a secure backend ("prevent users from easily 'cheating' their stats"). We'd be turning a compliance requirement into the signature mechanic. Demos exceptionally well to judges.
- **Tradeoff:** risks feeling surveillant or moralizing, and it can shame users having a bad week. Mitigation: self-reported tasks must remain fully first-class and never be labeled negatively — verified is a *bonus lane*, not a purity test. Never show Integrity ratio to other users without consent.

---

**D3 — The Chronicle: your history as generated narrative**
*Novel in this form.*

The mandated historical log gets a second, backward-facing surface: an auto-generated **chronicle** — a weekly illustrated log entry written in the app's voice, drawn from real data. *"Week 12. Three nights running you sat with the compiler until it yielded. Strength lay dormant. On the fourth day the streak broke, and on the fifth you began again."* Plus a **Season Recap** artifact at month end that's genuinely worth screenshotting.

- **Why:** answers Gap 3.4 (retrospection). Every competitor is a forward-facing to-do surface; KUBBO's skyline is the only lasting artifact in the whole survey and it's spatial, not temporal. It's also the only mechanic here that *appreciates* with use — it gets better the longer you stay, which is the structural opposite of habituation.
- **Fit:** uses the required historical log (R2) for something other than compliance. Very high demo value in a 90–180s video: scroll a rich chronicle to prove persistence *and* emotional payoff in one shot.
- **Tradeoff:** if LLM-generated it adds latency, cost, and a failure mode on the demo day. **Strong recommendation: template-driven with data-selected phrasing, deterministic, server-generated, no live model call in the critical path.** Cheaper, faster, more reliable, and honestly reads better than generic model prose.

---

**D4 — Momentum, not HP: decay you can see coming**

Replace binary streaks and Habitica-style HP with a continuous **Momentum multiplier** (say 1.0×–2.5×) that builds with consistency and **decays gradually and visibly** during inactivity — with the decay *forecast on screen before it happens* ("Momentum falls to 1.4× in 9 hours"), a small stock of **Momentum Shields** (Duolingo's Streak Freeze, earned not bought), and an explicit **Rest Day** you can declare that pauses decay guilt-free.

- **Why:** implements the conclusion of §3.3. It captures the loss-aversion retention benefit (Duolingo: 2.4× retention at 7+ day streaks) while avoiding the catastrophic failure state whose *removal* was Duolingo's biggest win (Streak Freeze: −21% churn for at-risk users). Momentum is a loss of *velocity*, recoverable in days; Habitica's death penalty is a loss of *earned progress*, and that's what people quit over.
- **Fit:** satisfies R5 (streaks) with more depth, and the forecast directly answers Gap 3.2(C) — Habitica #15268 exists because consequences arrive unexplained. Nothing here is ever a surprise.
- **Tradeoff:** softer than hard HP, so it will motivate the punishment-responsive user less. Mitigation: ship **Hardcore Mode** as an opt-in toggle (real HP, real death) for the users who want teeth — opt-in, never default, per §3.3.

---

**D5 — Campaigns: deadline-driven multi-stage quests**

Big projects become **Campaigns** with a real deadline, decomposed into stages. Urgency is computed from *remaining work ÷ remaining time* and drives the app's visual state (calm → tense → critical). Stages can carry start dates, so a quest that isn't available yet is visibly locked. Calendar view included.

- **Why:** answers Gap 3.4 (time-shape). Deadline proximity is the most naturally game-like variable in real life and almost nobody uses it as a difficulty curve.
- **Honest positioning:** ⚠️ **This is NOT novel.** MainQuest ships "boss battles [that] turn large projects into multi-step encounters" and TaskHero ships live combat. We should build it because it is genuinely useful and demos well — **not** claim it as our differentiator. Our angle can only be execution quality: real scheduling depth (start dates, estimates, calendar) that the RPG-flavored competitors skip.
- **Tradeoff:** scheduling depth is a large surface for a hackathon timeline and is invisible in screenshots. Scope carefully; it is the first thing to cut.

---

**D6 — Focus-thread coherence bonus**
*Novel — no product surveyed rewards this.*

Reward *coherence*, not just volume. Completing several tasks in the same attribute/campaign in one day compounds into a **Deep Work bonus**; scattering across many unrelated threads yields the raw sum with no bonus. Never a penalty — just an unclaimed bonus, so it's aspirational rather than punitive.

- **Why:** answers Gap 3.4 (context-switching cost). Every competitor rewards raw task count, which quietly incentivizes exactly the fragmented behavior productivity tools exist to fix. Dendedo enforces single-focus but doesn't reward it. This is genuinely unoccupied.
- **Fit:** trivial to compute from the same event log. Very cheap for the differentiation it buys.
- **Tradeoff:** users with genuinely varied obligations (a parent, a student across five subjects) shouldn't feel penalized — hence bonus-only, never penalty.

---

**D7 — Shared-stakes Pacts (only if time allows)**

Two-to-five people commit to a shared goal for a fixed window. Progress is pooled and visible. Unlike Habitica's shared-fate damage, **one person's miss never damages another** — it only slows the shared pool.

- **Why:** commitment-contract evidence is the strongest in this whole document (BMJ RCT: ~50% vs ~10% goal attainment; stickK ~3×), and body-doubling has real support for ADHD users. Habitica's damage-sharing is its signature mechanic *and* one of its biggest complaint sources (#15268) — sharing upside without sharing punishment is a real, defensible improvement.
- **Tradeoff:** ⚠️ Multi-user features are a hackathon trap — they need a second account to demo, they multiply auth/authorization surface, and they can't be shown convincingly in a 90–180s solo video. Also, removing shared punishment removes most of the accountability pressure, so it may simply not work as well as Habitica's harsher version. **Recommend: build only after everything above is polished.** Realistically, cut.

---

**Recommended cut line for a hackathon:** ship **R1–R10 + D2 + D4 + D3**, with **D1** and **D6** as cheap high-leverage additions if the event log is well-designed. **D5** partial (deadline urgency without full calendar). **D7** cut. Three sharp differentiators beat seven half-built ones — and the Streaks app (§2.10) is the standing proof that the most-awarded design in this market is the one that subtracted the most.

---

## 5. Visual / UI References

| Reference | Link | What to take |
|---|---|---|
| **Streaks (iOS)** | https://apps.apple.com/us/app/streaks/id963034692 | **The completion moment.** Press-and-hold with ring-fill + haptic. Apple Design Award winner; the most satisfying check-off in the category. Our spec demands "deeply satisfying" checkmarks — copy this interaction's *feel*, not its look. |
| **Finch** | https://apps.apple.com/app/id1528595748 | Warmth and approachability: pastel gradients, rounded geometry, generous whitespace, expressive idle animation on a character. The model for "encouraging, not demanding." Also study what they got *wrong*: a dense first run. |
| **KUBBO** | https://kubbo.app/ | Isometric/low-poly medieval blocks and soft lighting — proof that a cumulative visual artifact reads better than a number. Best argument for giving progress a *place*, not just a bar. |
| **Habitica** | https://habitica.com | Take: the Habit/Daily/To-Do taxonomy and the pixel-art avatar/equipment charm. Avoid: dense multi-column boards, and the gap flagged in [issue #361](https://github.com/HabitRPG/habitica/issues/361) where the UI chrome never matched the art quality. If we go pixel, the *entire* interface must commit. |
| **Forest** | https://forestapp.cc/ | Flat vector botanical illustration, muted earth palette, calm restraint. Best-in-class "one screen, one idea." |
| **MainQuest** | https://www.mainquest.net/ | Contemporary dark UI with indigo/purple accents and flat illustration — the current default look for modern gamified productivity. Useful as a **baseline to deliberately diverge from**, since it's where the market has converged. |
| **TaskHero** | https://taskhero.app/ | Illustrated cartoon-fantasy with combat feedback fired *on the checkmark*. The reference for coupling the game reaction tightly to the user action. |
| **Dendedo** | https://www.dendedo.com/ | Calm, low-chrome, one-thing-per-screen minimalism. The counterweight to RPG clutter — worth studying for our "don't clutter the screen with stats" requirement. |
| **EpicWin** (archival) | https://alternativeto.net/software/epic-win/ | Chunky illustrated fantasy UI with comic writing voice. Study the *tone of voice*, and remember it died — charm alone doesn't retain. |
| **Gamified Life OS (Notion)** | https://gamifiedlifeos.com/ | Solo-Leveling-style stat-panel layouts. Free information-architecture ideas for a character sheet — and a reminder that the whole genre is starved of actual motion. |

**Direction I'd argue for** (subject to review): commit hard to a **single cohesive theme with real typographic personality and a restrained palette** — the spec's "Crucial Warning" is aimed at generic Bootstrap/shadcn-default submissions, and the market has visibly converged on flat-dark-indigo (MainQuest, most Notion templates). Divergence is cheap points. Then spend disproportionate effort on **three** animation moments: task completion, level-up, and purchase. Those are the exact three the spec names.

---

## 6. Sources

**Products**
- Habitica — https://habitica.com · https://en.wikipedia.org/wiki/Habitica · https://habitica.fandom.com/wiki/Death_Mechanics · https://habitica.fandom.com/wiki/Habitica_Redesign_Fact_Sheet
- Habitica GitHub issue #15268 (unclear damage attribution) — https://github.com/HabitRPG/habitica/issues/15268
- Habitica GitHub issue #361 (interface style & aesthetics) — https://github.com/HabitRPG/habitica/issues/361
- Habitica Octalysis design review (Yu-kai Chou) — https://yukaichou.com/gamification-analysis/simon-duques-habitica-design-challenge/
- Habitica review/alternatives — https://productivity-apps.com/apps/habitica · https://www.alternativeto.net/software/habitica/about/
- Finch — https://apps.apple.com/app/id1528595748 · https://www.autonomous.ai/ourblog/finch-self-care-app-review-full-breakdown · https://cehhs.utk.edu/ero/managing-self-care-through-the-finch-app/ · https://geneticslab.medicine.iu.edu/blogs/md-student-news/wellness-corner-a-digital-pet-is-your-self-care-best-friend
- LifeUp — https://www.lifeupapp.fun/en/index.html · https://play.google.com/store/apps/details?id=net.sarasarasa.lifeup · https://www.appbrain.com/app/lifeup-gamified-to-do-list/net.sarasarasa.lifeup
- TaskHero — https://taskhero.app/ · https://apps.apple.com/us/app/taskhero/id1480746112 · https://play.google.com/store/apps/details?id=com.whetware.taskhero · https://gamifylist.com/app/taskhero
- MainQuest — https://www.mainquest.net/ · https://www.mainquest.net/features · https://www.mainquest.net/mainquest-vs-habitica *(vendor-published; treat as marketing)*
- KUBBO — https://kubbo.app/ · https://kubbo.app/features · https://apps.apple.com/us/app/kubbo-goal-tracker/id6749530918 · https://play.google.com/store/apps/details?id=io.apparence.dailywin
- Dendedo — https://www.dendedo.com/ · https://www.dendedo.com/blog/best-gamified-productivity-apps *(vendor-published)*
- Forest — https://forestapp.cc/ · https://screentimeindex.com/posts/forest-app-review/ · https://calmevo.com/forest-app-review/ · https://techweez.com/2026/07/24/forest-productivity-app-review/ · https://nerdynav.com/forest-vs-flora-pomodoro/
- EpicWin — https://alternativeto.net/software/epic-win/ · https://www.webmaster-source.com/2010/08/23/epicwin-a-to-do-list-app-with-an-rpg-theme/ · https://en.wikipedia.org/wiki/Supermono_Studios
- Streaks — https://apps.apple.com/us/app/streaks/id963034692 · https://calmevo.com/streaks-app-review/ · https://thesweetsetup.com/apps/best-habit-tracking-app-ios/ · https://chudo-minimalism.com/streaks-review-my-honest-thoughts-after-2-months-of-use/

**Notion gamification systems**
- https://www.notion.com/templates/gamified-task
- https://notiondone.com/product/gamified-life-os/ · https://gamifiedlifeos.com/
- https://www.liferpg.site/ · https://www.liferpg.site/resources/notion-gamification-template-life-rpg-2.0
- https://www.solt.ws/blog/top-10-notion-gamification-templates-to-gamify-your-life · https://www.solt.ws/blog/level-up-your-life-with-notion-gamify-habits-and-skill-tracking
- https://pathpages.com/blog/gamification-notion-template · https://ducktemplates.com/products/gamify-your-life-notion-template

**Behavioral / retention research**
- "Gaining Reward vs. Avoiding Loss: When Does Gamification Stop Being Fun?" — https://www.researchgate.net/publication/281176420_Gaining_Reward_vs_Avoiding_Loss_When_Does_Gamification_Stop_Being_Fun
- "An Exploratory Study of Health Habit Formation Through Gamification" (arXiv) — https://arxiv.org/pdf/1708.04418
- Duolingo streaks, Jackson Shuttleworth (Group PM, Retention) — https://www.getrecall.ai/summary/lennys-podcast/behind-the-product-duolingo-streaks-or-jackson-shuttleworth-group-pm-retention-team
- Duolingo streak psychology — https://www.justanotherpm.com/blog/the-psychology-behind-duolingos-streak-feature · https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f · https://dev.to/pocket_linguist/why-duolingos-gamification-works-and-when-it-doesnt-1d4
- Gamification retention statistics *(vendor blogs — directional only)* — https://www.digia.tech/post/gamification-mobile-apps-streaks-rewards-retention/ · https://www.strivecloud.io/blog/10-ways-to-drive-engagement · https://www.revenuecat.com/blog/growth/gamification-in-apps-complete-guide · https://trophy.so/blog/productivity-gamification-examples
- Commitment contracts — https://stickk.zendesk.com/hc/en-us/articles/206833157-How-it-Works · https://www.pledgd.com/blog/best-commitment-contract-apps · https://techcrunch.com/2008/02/15/stickk-allows-you-to-put-a-contract-on-yourself/
- Body doubling / ADHD accountability — https://add.org/the-body-double/ · https://chadd.org/adhd-news/adhd-news-adults/adhd-weekly-could-a-body-double-help-you-increase-your-productivity/ · https://arxiv.org/pdf/2509.12153 · https://www.simplypsychology.com/articles/body-doubling-adhd
- Critical perspective on gamification dark patterns — https://www.thebrink.me/gamified-life-dark-psychology-app-addiction/

---

## 7. Open Questions Before Design

1. Four rows of the Disqualification table are truncated in `requirements.txt`. Worth getting the full text from organizers — especially the "Invalid Repository" row.
2. **Name collision:** "LiFE RPG" is an established commercial Notion template (https://www.liferpg.site/). Fine for a hackathon; worth knowing.
3. Is the demo audience solo? If so, D7 (Pacts) is very likely not worth building — it cannot be demonstrated in the required video.
4. Theme decision gates the visual work and should be made early, since Design & UX is the pillar carrying the "Crucial Warning."
