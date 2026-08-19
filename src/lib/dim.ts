/** Shared DIM ELITE constants: the loop, navigation, tiers and copy. */

export const FOUNDING_CAP = 1000;

export const BETA_AVAILABILITY =
  "Elite Beta is currently available to the first 1,000 founding members.";

export const EARN_DISCLAIMER =
  "DIM provides pathways and opportunities that can help members turn digital capabilities into economic opportunities. DIM does not guarantee income.";

export type StageKey = "learn" | "build" | "connect" | "earn" | "grow";

export const STAGES: {
  key: StageKey;
  label: string;
  promise: string;
  blurb: string;
  to: string;
}[] = [
  {
    key: "learn",
    label: "Learn",
    promise: "I can gain knowledge.",
    blurb: "AI fundamentals, practical skills and learning paths built around your goals.",
    to: "/learn",
  },
  {
    key: "build",
    label: "Build",
    promise: "I can apply it.",
    blurb: "Projects, templates and a portfolio that proves what you can actually do.",
    to: "/build",
  },
  {
    key: "connect",
    label: "Connect",
    promise: "I can find people.",
    blurb: "Community spaces and a member directory for people to learn and build with.",
    to: "/community",
  },
  {
    key: "earn",
    label: "Earn",
    promise: "I can find opportunities.",
    blurb: "Pathways into freelancing, digital products, marketplace and opportunities.",
    to: "/earn",
  },
  {
    key: "grow",
    label: "Grow",
    promise: "I can progress.",
    blurb: "Career roadmap, achievements and visible progress over time.",
    to: "/career",
  },
];

export const stageClasses: Record<StageKey, { text: string; bg: string; ring: string; dot: string }> =
  {
    learn: { text: "text-learn", bg: "bg-learn/10", ring: "ring-learn/30", dot: "bg-learn" },
    build: { text: "text-build", bg: "bg-build/10", ring: "ring-build/30", dot: "bg-build" },
    connect: { text: "text-connect", bg: "bg-connect/10", ring: "ring-connect/30", dot: "bg-connect" },
    earn: { text: "text-earn", bg: "bg-earn/10", ring: "ring-earn/30", dot: "bg-earn" },
    grow: { text: "text-grow", bg: "bg-grow/10", ring: "ring-grow/30", dot: "bg-grow" },
  };

export type NavItem = { label: string; to: string; icon: string; soon?: boolean };

export const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  {
    group: "Main",
    items: [
      { label: "Home", to: "/dashboard", icon: "house" },
      { label: "Learn", to: "/learn", icon: "graduation-cap" },
      { label: "Build", to: "/build", icon: "hammer" },
      { label: "AI Tools", to: "/tools", icon: "wrench" },
      { label: "Community", to: "/community", icon: "messages-square" },
    ],
  },
  {
    group: "Grow",
    items: [
      { label: "Career", to: "/career", icon: "briefcase" },
      { label: "Creator", to: "/creator", icon: "palette" },
      { label: "Opportunities", to: "/opportunities", icon: "target", soon: true },
      { label: "Earn", to: "/earn", icon: "banknote", soon: true },
    ],
  },
  {
    group: "Ecosystem",
    items: [
      { label: "Marketplace", to: "/marketplace", icon: "store", soon: true },
      { label: "Events", to: "/events", icon: "calendar-days", soon: true },
      { label: "Networking", to: "/connect", icon: "users-round" },
    ],
  },
  {
    group: "Personal",
    items: [
      { label: "My Portfolio", to: "/portfolio", icon: "folder-open" },
      { label: "Achievements", to: "/achievements", icon: "award" },
      { label: "Progress", to: "/progress", icon: "chart-no-axes-column" },
      { label: "Profile", to: "/profile", icon: "user-round" },
    ],
  },
  {
    group: "Beta",
    items: [
      { label: "Elite Beta", to: "/elite-beta", icon: "flask-conical" },
      { label: "Coming Soon", to: "/coming-soon", icon: "sparkles" },
    ],
  },
];

/** Sticky bottom bar: the five main features members use every day. */
export const TAB_ITEMS: NavItem[] = [
  { label: "Home", to: "/dashboard", icon: "house" },
  { label: "Learning", to: "/learn", icon: "graduation-cap" },
  { label: "AI Tools", to: "/tools", icon: "wrench" },
  { label: "Build", to: "/build", icon: "hammer" },
  { label: "Community", to: "/community", icon: "messages-square" },
];

export const TIERS = [
  {
    name: "Starter",
    price: "Free",
    cadence: "public entry tier",
    line: "I want to explore.",
    features: ["Selected learning content", "AI Tools Directory preview", "Community access"],
  },
  {
    name: "Creator",
    price: "R95",
    cadence: "per month",
    line: "I want to build and earn.",
    features: ["Creator learning", "Creator resources", "Challenges & templates", "Creator community"],
  },
  {
    name: "Career",
    price: "R250",
    cadence: "per month",
    line: "I want to become job-ready and grow.",
    features: ["Career roadmap", "Job readiness", "Interview prep", "Career community"],
  },
  {
    name: "8-Month Career",
    price: "R1,650",
    cadence: "once-off",
    line: "I want to commit to my career development.",
    features: ["Full career programme", "Structured 8-month journey", "Career community"],
  },
];

export const ELITE_INCLUDES = [
  "The complete Learning Hub and every learning path",
  "The full AI Tools Directory with personalized discovery",
  "Creator Hub — resources, challenges, templates",
  "Career Hub — roadmap, CV, interviews, job readiness",
  "Build Hub, projects and a shareable DIM portfolio",
  "Full community, spaces and member networking",
  "Achievements, progress tracking and your member scorecard",
  "Beta Command Center — shape the product directly",
  "Every Coming Soon feature as it launches",
];

export const ONBOARDING_GOALS = [
  "Learn AI",
  "Build projects",
  "Become a creator",
  "Grow my career",
  "Find opportunities",
  "Start earning",
  "Build a business",
  "Meet people",
];

export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const INTEREST_OPTIONS = [
  "AI fundamentals",
  "Prompting",
  "Content creation",
  "Short-form video",
  "Design",
  "Writing",
  "Coding",
  "Data & analytics",
  "Marketing",
  "Entrepreneurship",
  "Freelancing",
  "Automation",
  "Productivity",
  "Career development",
  "Education",
  "Future of work",
];

export const TOOL_CATEGORIES = [
  "Productivity",
  "Writing",
  "Design",
  "Video",
  "Audio",
  "Coding",
  "Research",
  "Marketing",
  "Business",
  "Education",
  "Career",
  "Automation",
  "Content Creation",
  "Entrepreneurship",
];

export const COMING_SOON_FEATURES: {
  key: string;
  title: string;
  to: string;
  summary: string;
  bullets: string[];
}[] = [
  {
    key: "marketplace",
    title: "Marketplace",
    to: "/marketplace",
    summary: "Digital products, services, templates, resources and freelance offerings from the DIM community.",
    bullets: [
      "Digital products",
      "Services",
      "Creator products",
      "Templates & resources",
      "AI-related offerings",
      "Freelance services",
    ],
  },
  {
    key: "earn",
    title: "Earn",
    to: "/earn",
    summary: "Skills become valuable when you can apply them. Earn brings the pathways together in one place.",
    bullets: [
      "Creator opportunities",
      "Marketplace selling",
      "Freelancing",
      "Digital products",
      "Referrals",
      "Projects & collaborations",
    ],
  },
  {
    key: "opportunities",
    title: "Opportunities",
    to: "/opportunities",
    summary: "One hub for career, creator, business and community opportunities.",
    bullets: [
      "Jobs, internships, graduate programmes",
      "Creator campaigns & collaborations",
      "Projects & partnerships",
      "Events, challenges & hackathons",
    ],
  },
  {
    key: "events",
    title: "Events",
    to: "/events",
    summary: "DIM Open Days, workshops, webinars and community sessions — discover, register, attend, participate.",
    bullets: [
      "DIM Open Days",
      "Workshops & webinars",
      "Career sessions",
      "Creator sessions",
      "Networking events",
    ],
  },
];
