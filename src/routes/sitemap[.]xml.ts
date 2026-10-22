import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";

import { ARTICLES, ECOSYSTEM, SITE_URL } from "@/lib/site";
import { isSitemapRouteIncluded, sitemapPathForLocation, sitemapStaticPaths, sitemapXML, type SitemapEntry } from "@/lib/sitemap";

const BASE_URL = SITE_URL;

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

        const areaId = "/explore/$area";
        if (isSitemapRouteIncluded(router.routesById[areaId])) {
          for (const a of ECOSYSTEM) {
            const location = router.buildLocation({ to: "/explore/$area", params: { area: a.slug }, search: () => ({}), hash: "" });
            const path = sitemapPathForLocation(router, location, areaId);
            if (path) entries.push({ path });
          }
        }
        const articleId = "/insights/$slug";
        if (isSitemapRouteIncluded(router.routesById[articleId])) {
          for (const a of ARTICLES) {
            const location = router.buildLocation({ to: "/insights/$slug", params: { slug: a.slug }, search: () => ({}), hash: "" });
            const path = sitemapPathForLocation(router, location, articleId);
            if (path) entries.push({ path });
          }
        }

        if (entries.length === 0) {
          return new Response("No pages are included in this sitemap.", { status: 404, headers: { "Cache-Control": "no-store" } });
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
