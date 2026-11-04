<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AppShell accepts page-owned scrollHeader controls; keep Community filters tied to its local feed/space state rather than duplicating global navigation.
- Public company website lives in top-level routes (/, /explore, /elite, /society, /organisations, /about, /insights, /contact, /privacy, /terms) wrapped in `SiteLayout`; its copy, feature statuses and contact details come from `src/lib/site.ts` so claims stay consistent and nothing unverified is shown.
- "/" is the public homepage and no longer auto-redirects signed-in members; sign-in/sign-up and onboarding still land members in /community.
- Founding membership is claimed in the `_authenticated` layout's beforeLoad (once per session) so members get their place wherever they land.
- Public enquiries go through the `submitEnquiry` server function (validation, honeypot, per-email rate limit) into a private table readable only by admins.
- Every route declares `staticData.sitemap`; the `_authenticated` subtree is excluded and /sitemap.xml is built from the router.
- Social-graph tables (follows, likes, feedback_votes) are owner-only under RLS; any public aggregate (like counts, vote counts) must come from the `like_counts` / `feedback_vote_counts` views, never from reading the raw table — this keeps member-level activity private while counts stay visible.
