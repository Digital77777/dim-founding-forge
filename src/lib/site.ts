/**
 * Public company website content model for Digital Intelligence Marketplace.
 * Everything shown on the public site is defined here so claims, statuses and
 * contact details stay consistent and easy to update in one place.
 */

export const SITE_URL = "https://digitalintelligencemarketplace.com";
export const COMPANY = "Digital Intelligence Marketplace";
export const TAGLINE = "Elevate Your Digital IQ.";

/**
 * Verified contact details. Leave a value as null until it has been confirmed —
 * the website hides anything that is null instead of showing invented details.
 */
export const CONTACT: { email: string | null; phone: string | null; address: string | null } = {
  email: null,
  phone: null,
  address: null,
};

/** Verified social profiles only. Add entries like { label: "LinkedIn", href: "https://…" }. */
export const SOCIALS: { label: string; href: string }[] = [];

/**
 * Verified WhatsApp contact. The floating button and contact page link here;
 * update the number in one place.
 */
export const WHATSAPP_DISPLAY = "+27 67 164 2375";
export const WHATSAPP_NUMBER = "27671642375";
export const WHATSAPP_MESSAGE = "Hi DIM, I'd like to know more.";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export type Status = "available" | "beta" | "development" | "planned";

export const STATUS_LABEL: Record<Status, string> = {
  available: "Available now",
  beta: "In beta",
  development: "In development",
  planned: "Planned",
};

export type AreaSlug = "learning" | "ai-tools" | "community" | "career" | "build" | "creator" | "marketplace";

export type EcosystemArea = {
  slug: AreaSlug;
  name: string;
  stage: "Learn" | "Build" | "Connect" | "Earn" | "Grow";
  status: Status;
  summary: string;
  problem: string;
  audience: string[];
  benefits: string[];
  /** In-app destination. Signed-out visitors are sent through sign-in first. */
  appPath: string;
  cta: string;
};

export const ECOSYSTEM: EcosystemArea[] = [
  {
    slug: "learning",
    name: "Learning Hub",
    stage: "Learn",
    status: "available",
    summary: "Courses and resources on AI fundamentals and practical digital skills, organised so you can learn at your own pace.",
    problem: "AI learning is scattered across videos, threads and paid courses, and it is hard to know where to start.",
    audience: ["Students", "People exploring AI for the first time", "Professionals adding AI to their work"],
    benefits: [
      "Structured courses with lessons you can track",
      "Resources grouped by DIM area — learn, build, career, creator",
      "Progress saved to your DIM account",
    ],
    appPath: "/learn",
    cta: "Open the Learning Hub",
  },
  {
    slug: "ai-tools",
    name: "AI Tools Directory",
    stage: "Learn",
    status: "available",
    summary: "A curated directory of AI tools, grouped by what they help you do — studying, writing, design, research, work and more.",
    problem: "There are thousands of AI tools and little guidance on which ones are useful for your goals.",
    audience: ["Students", "Creators", "Early-career professionals"],
    benefits: [
      "Browse tools by category and use case",
      "Short explanations of what each tool is for",
      "Save the tools that fit how you work",
    ],
    appPath: "/tools",
    cta: "Browse AI tools",
  },
  {
    slug: "community",
    name: "Community",
    stage: "Connect",
    status: "available",
    summary: "Discussion spaces, photo and video posts, reels and a member directory where DIM members learn alongside each other.",
    problem: "Learning alone is slow. People grow faster when they can share questions, wins and work with others.",
    audience: ["Every DIM member", "Student communities", "Creators sharing their work"],
    benefits: [
      "Topic spaces for learning, building, careers and creating",
      "Text, photo, video and reel posts",
      "Find and follow other members",
    ],
    appPath: "/community",
    cta: "Enter the community",
  },
  {
    slug: "career",
    name: "Career Development",
    stage: "Grow",
    status: "available",
    summary: "Set a career goal and get an AI-generated roadmap with milestones you can tick off, plus career learning resources.",
    problem: "Many people know they want to work with AI but have no clear path from where they are today.",
    audience: ["Students and graduates", "Early-career professionals", "Career changers"],
    benefits: [
      "Guided career goal setup",
      "AI-generated personal roadmap and next steps",
      "Milestone tracking saved to your account",
    ],
    appPath: "/career",
    cta: "Explore DIM Career",
  },
  {
    slug: "build",
    name: "Build & Portfolio",
    stage: "Build",
    status: "available",
    summary: "Record the projects you create with AI and present them in a shareable DIM portfolio.",
    problem: "Skills are hard to prove without evidence of what you have actually made.",
    audience: ["Learners applying new skills", "Job seekers", "Freelancers"],
    benefits: ["Log projects and the tools you used", "Choose which projects are public", "A portfolio you can share"],
    appPath: "/build",
    cta: "Start building",
  },
  {
    slug: "creator",
    name: "Creator Hub",
    stage: "Earn",
    status: "available",
    summary: "Creator learning and resources for people producing content and digital products with AI.",
    problem: "Creators need practical guidance on using AI well, not just lists of tools.",
    audience: ["Content creators", "Freelancers", "Aspiring digital entrepreneurs"],
    benefits: ["Creator-focused courses and resources", "Connects to the community and Build Hub"],
    appPath: "/creator",
    cta: "Visit the Creator Hub",
  },
  {
    slug: "marketplace",
    name: "Marketplace",
    stage: "Earn",
    status: "development",
    summary: "A planned space for DIM members to offer and discover digital products, services, templates and freelance work.",
    problem: "Creators and freelancers need a trusted place to share what they make with people who need it.",
    audience: ["Creators and freelancers", "People looking for digital products and services"],
    benefits: ["Planned: list digital products and services", "Planned: discover work from the DIM community"],
    appPath: "/marketplace",
    cta: "See marketplace plans",
  },
];

export const findArea = (slug: string) => ECOSYSTEM.find((a) => a.slug === slug);

export type Audience = { title: string; body: string; to: string; cta: string };

export const AUDIENCES: Audience[] = [
  { title: "Students and learners", body: "Explore AI tools for your studies, build practical skills and learn with peers.", to: "/explore/learning", cta: "Start learning" },
  { title: "Early-career professionals", body: "Set a career goal, follow a personal roadmap and show your work in a portfolio.", to: "/explore/career", cta: "Explore careers" },
  { title: "Creators and freelancers", body: "Use AI in your creative work, share it with the community and follow the marketplace as it develops.", to: "/explore/creator", cta: "For creators" },
  { title: "Universities and student communities", body: "Explore ways to bring practical AI awareness and community to students.", to: "/organisations", cta: "Partner with DIM" },
  { title: "Businesses and organisations", body: "Talk to us about digital intelligence, AI adoption and skills.", to: "/organisations", cta: "Start a conversation" },
  { title: "AI tool providers and opportunity partners", body: "Explore how your tool or opportunity could reach the DIM community.", to: "/organisations", cta: "Enquire" },
];

export const ENQUIRY_TYPES = [
  "University or student community",
  "Business or employer",
  "AI tool provider",
  "Community organisation",
  "Media",
  "General question",
] as const;

export type Article = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  body: string[];
};

export const INSIGHT_CATEGORIES = [
  "Practical AI",
  "AI Tools and Workflows",
  "Digital Skills",
  "Career Development",
  "Student Resources",
  "Creator Opportunities",
  "DIM Updates",
  "Community Stories",
];

/** Published articles. Add genuine articles here — the Insights pages and sitemap pick them up. */
export const ARTICLES: Article[] = [];

export function pageHead(path: string, title: string, description: string) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: COMPANY },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
