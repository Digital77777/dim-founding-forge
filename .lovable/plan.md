# DIM ELITE — Founding 1,000 Beta (Phase 1)

One app, one account, one ecosystem. This phase builds the Elite foundation with a real backend: accounts, Founding Member numbering, personalized onboarding, the connected dashboard, and the core hubs. Phase 2+ surfaces appear as proper "Coming Soon — Included in DIM Elite" experiences rather than dead links.

## What gets built

**Public entry**
- Landing page at `/`: "DIM ELITE — THE FIRST 1,000", the LEARN. BUILD. CONNECT. EARN. GROW. loop, what's included, live founding-spots counter (e.g. "726 of 1,000 remaining"), tier comparison (Starter free / Creator R95pm / Career R250pm / 8-Month Career R1,650 once-off / Elite Founding Beta free), and a clear no-fixed-end-date statement.
- Sign up / sign in at `/auth` (email + password, plus Google sign-in).

**Onboarding (5 screens, after first sign-in)**
1. Welcome + your Founding Member number (#0274 / 1000)
2. What do you want to achieve? (Learn AI, Build projects, Become a creator, Grow my career, Find opportunities, Start earning, Build a business, Meet people)
3. Experience level (Beginner / Intermediate / Advanced)
4. Interests (topic chips)
5. "Your DIM Journey is ready" → dashboard

**Elite Dashboard** (`/dashboard`)
- Personalized greeting + Founding 1,000 badge and member number.
- Your DIM Journey: Learn → Build → Connect → Earn → Grow with real progress per stage.
- Focus-today cards driven by the member's goals: next lesson, recommended AI tool, active project, community activity, opportunity teaser.
- Member Scorecard (Learning / Building / Connecting / Earning / Growing percentages, framed as guidance not judgment).

**Navigation** (grouped so it never feels overwhelming)
- MAIN: Home, Learn, Build, AI Tools, Community
- GROW: Career, Creator, Opportunities, Earn
- ECOSYSTEM: Marketplace, Events, Networking
- PERSONAL: My Portfolio, Achievements, Progress, Profile
- BETA: Elite Beta, Feedback, Coming Soon

**Learn** — Learning Hub with learning paths (AI Beginner, AI Creator, AI Career, AI Entrepreneur, Digital Productivity, AI Tools, Future of Work), courses → modules → lessons, enrollment, lesson completion, progress tracking, and achievement triggers. Seeded with real starter courses so the hub is populated on day one.

**AI Tools Directory** — full directory with search and filtering across the 14 categories, tool detail (what it does, who it's for, use cases, pricing tier, skill level, recommended applications), save-to-my-tools, and "explored" tracking for the Tool Explorer achievement. Plus **Personalized Discovery**: "What are you trying to accomplish?" returns a recommended stack (goal → tools + suggested learning path), pre-mapped for common goals like TikTok videos, data analyst, launch an online business.

**Creator Hub** — premium learning, tools, prompt/content/business/freelancing resources, creator challenges, project templates, portfolio prompts, creator community entry, creator achievements. Answers "What do I need to build, launch and grow?"

**Career Hub** — career roadmap, skills development, career learning paths, CV/interview/job-readiness resources, certifications, workshops, mentorship and career community entry. Answers "What do I need to become job-ready and accelerate my career?"

**Community** — posts, comments, likes, and spaces for DIM Learn, DIM Build, DIM Earn, Creator and Career conversations. Founding 1,000 badge renders on every post and profile.

**Profile / Portfolio** — photo, bio, skills, interests, career goals, projects, certifications, achievements, creator status, community activity, founding member marker; public shareable profile URL.

**Achievements** — Founding Member, First Course, First Project, Creator, Career Ready, Community Builder, Tool Explorer, DIM Contributor. Awarded automatically from real activity, with an unlock feed.

**Beta Command Center** (`/elite-beta`) — "You are helping build DIM", founding member number, and submissions for bugs, feature requests, ideas, feedback and content suggestions, plus upvoting on ideas and a visible "your feedback helps shape the platform" loop with status labels (Received → Reviewing → Planned → Shipped).

**Coming Soon system** — one reusable experience for Build (interactive shell in Phase 1), Marketplace, Earn, Opportunities, Events, Networking: "COMING SOON — Included in DIM Elite", the explainer copy, and Notify Me / See What's Available Now buttons. Notify Me records real interest so we learn demand ranking.

**Notifications** — unified center for course, project, community, tool, opportunity, event, achievement, recommendation and beta-update notifications.

**Admin (Elite management)** — role-gated view of Elite members, founding numbers, signup date, onboarding completion, learning progress, community participation, feedback/bugs/feature requests with status control, and beta funnel analytics (acquisition → activation → engagement → retention).

## Wording safeguards
Earn and Opportunities language promises pathways, never income: "DIM provides pathways and opportunities that can help members turn digital capabilities into economic opportunities." No beta end date anywhere; only "Elite Beta is currently available to the first 1,000 founding members." No financial or equity benefits mentioned. Founding Member status stated as retained beyond the beta, with future access defined later.

## Design direction
Bright, modern, energetic: light surfaces, confident accent color, bold display type, energetic gradients reserved for the Elite/Founding treatments, and a distinct gold-tinted Founding 1,000 badge that reads as earned status against the bright palette. All colors as semantic tokens; the five loop stages (Learn/Build/Connect/Earn/Grow) get consistent stage colors used everywhere they appear.

## Technical notes
- Lovable Cloud (database, auth, storage) enabled for this build.
- Tables: profiles, elite_members (founding_number assigned atomically with a 1,000 cap), onboarding_responses, learning_paths, courses, modules, lessons, enrollments, lesson_progress, ai_tools, tool_saves, tool_views, goal_recommendations, projects, achievements, member_achievements, community_spaces, posts, comments, likes, connections, feedback_items, feedback_votes, notifications, coming_soon_interest, user_roles.
- Roles in a separate `user_roles` table with a security-definer `has_role()` function; admin checks never client-side.
- RLS on every table, with explicit grants; public catalog data (courses, tools, landing counter) readable via narrow public policies so the landing page and SEO work without a session.
- Reads through TanStack server functions; protected pages live under the authenticated route group. Seed data (paths, courses, lessons, ~80 AI tools across all 14 categories, community spaces, achievements) ships in the migration so nothing is empty.
- Per-route SEO metadata on all public routes.

## Out of scope this phase
Full Build workspace, Marketplace transactions, Earn payouts, live Opportunities feed, Events registration, Networking matching, and the AI Career Advisor generation engine — each represented by the Coming Soon experience and delivered in Phase 2/3.
