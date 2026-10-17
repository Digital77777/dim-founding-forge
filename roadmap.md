# DIM ELITE roadmap

## Done
- Founding-member system, onboarding gate, dashboard in shared AppShell
- Learn / Tools / Build / Creator / Career hubs, Community hybrid feed (Facebook-style text, Instagram-style media)
- Reels: full-screen vertical feed, Create Reel flow (device upload + YouTube link), tag/creator/search/following filters, next-video preloading

## Done: DIM Career Hub experience (`/career`)
Premium career-acceleration experience replacing the current Career hub page, reusing the existing route, AppShell, design tokens and auth.

- Hero: "Turn Your AI Skills Into a Career." + animated GOAL → SKILLS → LEARNING → PROJECTS → PORTFOLIO → CERTIFICATIONS → PREPARATION → OPPORTUNITIES visual
- The career problem: fragmented vs connected comparison
- Career AI Advisor section — product preview only (no AI advisor exists yet) linking to an honest Coming Soon
- Career roadmap visual + "Create My Roadmap" CTA
- All 18 Career features as cards (number, icon, name, description, how it helps, CTA) wired to real routes or Coming Soon
- Signature "Your Career Journey, Connected." interactive 10-step journey (DISCOVER → GROW), horizontal on desktop, vertical on mobile, scroll-progress line, `prefers-reduced-motion` respected
- Career dashboard preview clearly labelled as a preview unless bound to real member data
- Career tools (links to existing AI Tools Directory), portfolio → opportunity flow, community/networking/mentorship trio, opportunities cards, audience cards (student, graduate, early-career, career changer)
- DIM ecosystem tie-in (LEARN → BUILD → CONNECT → EARN → GROW), value proposition, "where are you on your journey?" personalization, final CTA
- Keep existing hub content (career courses + resource shelves) reachable
- Rules: zero dead buttons, no fabricated functionality or outcomes, SEO title/description + single H1, accessible + responsive, no navigation-triggered error boundary

- [x] Career goal setup, AI roadmap (Lovable AI) and milestone tracking at /roadmap
- [x] Replace global scrolling navigation with Community-only feed filters, space filters and Community shortcuts beneath the sticky header.
- [x] Sticky footer tabs: Community (first, since it is the sign-in home page) replaces Home; Marketplace added; order Community / Learning / AI Tools / Build / Marketplace.
