/**
 * DIM Career content model. Every CTA points at a route that exists today —
 * anything not built yet routes to the honest Coming Soon experience.
 */

export type CareerLink = { label: string; to: string; soon?: boolean };

export type CareerFeature = {
  n: string;
  icon: string;
  name: string;
  description: string;
  helps: string[];
  cta: CareerLink;
};

export const CAREER_FEATURES: CareerFeature[] = [
  {
    n: "01",
    icon: "map",
    name: "Career Roadmap",
    description:
      "A personalized pathway showing the skills, experience, projects and milestones needed for your desired career.",
    helps: [
      "Gives you direction",
      "Breaks big goals into steps",
      "Shows what to learn next",
      "Reduces career confusion",
    ],
    cta: { label: "Explore Roadmap", to: "/roadmap" },
  },
  {
    n: "02",
    icon: "sparkles",
    name: "Career AI Advisor",
    description:
      "AI-powered career guidance designed around your goals, skills, experience, interests, certifications, portfolio and progress.",
    helps: [
      "Personalized guidance",
      "Identifies potential skill gaps",
      "Suggests development priorities",
      "Supports better decisions",
    ],
    cta: { label: "Meet Your AI Advisor", to: "/coming-soon", soon: true },
  },
  {
    n: "03",
    icon: "graduation-cap",
    name: "Career Learning Paths",
    description:
      "Structured learning journeys designed around career development and job readiness.",
    helps: [
      "Learn in the right sequence",
      "Connect learning to career goals",
      "Avoid random course picking",
      "Track development",
    ],
    cta: { label: "Explore Learning Paths", to: "/learn" },
  },
  {
    n: "04",
    icon: "hammer",
    name: "Professional & Practical Skills",
    description:
      "Develop practical AI, digital and professional capabilities that can be applied to real-world work.",
    helps: [
      "Apply skills to real projects",
      "Build confidence with AI",
      "Develop digital capabilities",
      "Move beyond theory",
    ],
    cta: { label: "Develop My Skills", to: "/build" },
  },
  {
    n: "05",
    icon: "award",
    name: "Professional Certifications",
    description:
      "Certification-focused resources and pathways that can support recognized professional development, including AWS, Microsoft, Google Cloud, Cisco, Salesforce, Oracle and Azure.",
    helps: [
      "Creates structured goals",
      "Supports professional development",
      "Strengthens your profile",
      "Complements practical projects",
    ],
    cta: { label: "Explore Certifications", to: "/coming-soon", soon: true },
  },
  {
    n: "06",
    icon: "wrench",
    name: "Career AI Tools Directory",
    description:
      "A curated collection of AI and digital tools selected to help you learn faster and become more career-ready.",
    helps: [
      "Discover useful tools",
      "Improve productivity",
      "Accelerate research",
      "Prepare more efficiently",
    ],
    cta: { label: "Explore Career Tools", to: "/tools" },
  },
  {
    n: "07",
    icon: "folder-open",
    name: "Portfolio Building",
    description: "Build and organize evidence of what you can actually do.",
    helps: [
      "Turn skills into visible proof",
      "Showcase projects",
      "Demonstrate achievements",
      "Build credibility",
    ],
    cta: { label: "Build My Portfolio", to: "/portfolio" },
  },
  {
    n: "08",
    icon: "file-text",
    name: "CV / Resume Preparation",
    description:
      "Resources to help you present your skills, projects, experience and achievements professionally.",
    helps: [
      "Organize experience",
      "Present skills clearly",
      "Prepare for applications",
      "Connect CV and portfolio",
    ],
    cta: { label: "Prepare My CV", to: "/profile" },
  },
  {
    n: "09",
    icon: "messages-square",
    name: "Interview Preparation",
    description:
      "Prepare for interviews with structured resources and AI-assisted practice where available.",
    helps: [
      "Practice interview questions",
      "Improve communication",
      "Build confidence",
      "Prepare around your goals",
    ],
    cta: { label: "Prepare for Interviews", to: "/coming-soon", soon: true },
  },
  {
    n: "10",
    icon: "users",
    name: "Career Community",
    description:
      "Connect with people pursuing professional growth through a dedicated career-focused community.",
    helps: [
      "Ask career questions",
      "Share experiences",
      "Discover resources",
      "Learn with others",
    ],
    cta: { label: "Join Career Community", to: "/community" },
  },
  {
    n: "11",
    icon: "users-round",
    name: "Networking",
    description:
      "Connect with people based on skills, interests, career goals, projects, institutions and industries.",
    helps: [
      "Meet collaborators",
      "Learn from others",
      "Expand your network",
      "Build relationships",
    ],
    cta: { label: "Start Networking", to: "/connect" },
  },
  {
    n: "12",
    icon: "compass",
    name: "Career Mentorship",
    description:
      "Discover mentorship-related opportunities within the DIM ecosystem when available.",
    helps: [
      "Learn from experience",
      "Gain new perspectives",
      "Receive guidance",
      "Build connections",
    ],
    cta: { label: "Explore Mentorship", to: "/coming-soon", soon: true },
  },
  {
    n: "13",
    icon: "briefcase",
    name: "Jobs & Internships",
    description:
      "Discover relevant jobs, internships and professional opportunities where available.",
    helps: [
      "Find opportunities in one place",
      "Connect preparation with action",
      "Move toward real experience",
      "Pursue opportunities",
    ],
    cta: { label: "Explore Opportunities", to: "/opportunities", soon: true },
  },
  {
    n: "14",
    icon: "rocket",
    name: "Graduate & Early-Career",
    description:
      "Discover opportunities designed for students, graduates and early-career professionals.",
    helps: [
      "Support the transition to work",
      "Discover relevant openings",
      "Connect skills to progression",
      "Explore new pathways",
    ],
    cta: { label: "Explore Graduate Opportunities", to: "/opportunities", soon: true },
  },
  {
    n: "15",
    icon: "chart-no-axes-column",
    name: "Career Progress Tracking",
    description:
      "Track development across skills, learning, projects, certifications and career preparation.",
    helps: [
      "Make progress visible",
      "See accomplishments",
      "Spot gaps",
      "Stay focused",
    ],
    cta: { label: "View My Progress", to: "/progress" },
  },
  {
    n: "16",
    icon: "crown",
    name: "Achievements & Badges",
    description: "Earn recognition for milestones reached throughout your DIM Career journey.",
    helps: [
      "Makes progress rewarding",
      "Encourages development",
      "Visible achievements",
      "Strengthens your profile",
    ],
    cta: { label: "View Achievements", to: "/achievements" },
  },
  {
    n: "17",
    icon: "calendar-days",
    name: "Workshops & Events",
    description:
      "Access career-focused workshops, webinars, sessions and events when available.",
    helps: [
      "Learn beyond courses",
      "Meet professionals",
      "Gain practical insight",
      "Connect learning to the real world",
    ],
    cta: { label: "Explore Events", to: "/events", soon: true },
  },
  {
    n: "18",
    icon: "target",
    name: "Opportunities & Challenges",
    description:
      "Take part in career-focused challenges, projects and opportunities designed to help you apply what you know.",
    helps: [
      "Gain practical experience",
      "Turn learning into projects",
      "Strengthen your portfolio",
      "Demonstrate capability",
    ],
    cta: { label: "Explore Challenges", to: "/build" },
  },
];

export type JourneyStep = {
  n: string;
  key: string;
  title: string;
  headline: string;
  body: string;
  examples: string[];
  cta: CareerLink;
  icon: string;
};

export const CAREER_JOURNEY: JourneyStep[] = [
  {
    n: "01",
    key: "discover",
    title: "Discover",
    headline: "Define Your Direction.",
    body: "Start with the career you want to pursue and understand the possibilities available to you.",
    examples: ["Career goals", "Industries", "Job roles", "Interests"],
    cta: { label: "Explore Career Paths", to: "/learn" },
    icon: "compass",
  },
  {
    n: "02",
    key: "assess",
    title: "Assess",
    headline: "Understand Where You Are.",
    body: "Identify your current skills, experience and potential development areas.",
    examples: ["Skills", "Experience", "Interests", "Skill gaps"],
    cta: { label: "Assess My Skills", to: "/profile" },
    icon: "chart-no-axes-column",
  },
  {
    n: "03",
    key: "learn",
    title: "Learn",
    headline: "Learn What Matters.",
    body: "Follow structured learning paths aligned with your career direction.",
    examples: ["AI skills", "Digital skills", "Professional skills", "Career paths"],
    cta: { label: "Explore Learning", to: "/learn" },
    icon: "graduation-cap",
  },
  {
    n: "04",
    key: "build",
    title: "Build",
    headline: "Turn Knowledge Into Capability.",
    body: "Apply what you learn through practical projects and challenges.",
    examples: ["Projects", "AI applications", "Challenges", "Problem solving"],
    cta: { label: "Explore Projects", to: "/build" },
    icon: "hammer",
  },
  {
    n: "05",
    key: "certify",
    title: "Certify",
    headline: "Build Recognized Knowledge.",
    body: "Prepare for relevant professional certifications and structured development goals.",
    examples: ["Certification pathways", "Structured goals"],
    cta: { label: "Explore Certifications", to: "/coming-soon", soon: true },
    icon: "award",
  },
  {
    n: "06",
    key: "showcase",
    title: "Showcase",
    headline: "Prove What You Can Do.",
    body: "Turn projects, skills and achievements into a professional portfolio.",
    examples: ["Portfolio", "Projects", "Achievements", "DIM profile"],
    cta: { label: "Build My Portfolio", to: "/portfolio" },
    icon: "folder-open",
  },
  {
    n: "07",
    key: "prepare",
    title: "Prepare",
    headline: "Get Career Ready.",
    body: "Prepare yourself for professional opportunities.",
    examples: ["CV", "Interview preparation", "Professional profile"],
    cta: { label: "Prepare for Opportunities", to: "/profile" },
    icon: "file-text",
  },
  {
    n: "08",
    key: "connect",
    title: "Connect",
    headline: "Build Your Network.",
    body: "Connect with people, communities, professionals and mentors within the DIM ecosystem when available.",
    examples: ["Community", "Networking", "Mentorship", "Events"],
    cta: { label: "Connect With DIM", to: "/connect" },
    icon: "users-round",
  },
  {
    n: "09",
    key: "apply",
    title: "Apply",
    headline: "Discover What's Next.",
    body: "Explore jobs, internships, graduate opportunities, challenges and other professional opportunities where available.",
    examples: ["Jobs", "Internships", "Graduate programmes", "Challenges"],
    cta: { label: "Explore Opportunities", to: "/opportunities", soon: true },
    icon: "briefcase",
  },
  {
    n: "10",
    key: "grow",
    title: "Grow",
    headline: "Keep Moving Forward.",
    body: "Continue developing skills, experience, network and professional opportunities.",
    examples: ["New skills", "New projects", "New certifications", "New opportunities"],
    cta: { label: "Continue My Journey", to: "/progress" },
    icon: "zap",
  },
];

export const CAREER_AUDIENCES = [
  {
    title: "Student",
    line: "Build skills before you graduate.",
    items: ["Learning", "Projects", "Certifications", "Portfolio", "Internships"],
    cta: { label: "Start Here", to: "/learn" } as CareerLink,
  },
  {
    title: "Graduate",
    line: "Turn your education into career momentum.",
    items: ["Career roadmap", "CV", "Portfolio", "Interview prep", "Graduate opportunities"],
    cta: { label: "Build My Path", to: "/roadmap" } as CareerLink,
  },
  {
    title: "Early-Career Professional",
    line: "Accelerate your next move.",
    items: ["Upskilling", "AI tools", "Certifications", "Networking", "Opportunities"],
    cta: { label: "Accelerate My Career", to: "/tools" } as CareerLink,
  },
  {
    title: "Career Changer",
    line: "Build a pathway into a new field.",
    items: ["Skills assessment", "Learning paths", "Projects", "Portfolio", "Preparation"],
    cta: { label: "Explore My Options", to: "/build" } as CareerLink,
  },
];

export const CAREER_OPPORTUNITY_CARDS = [
  { label: "Jobs", to: "/opportunities", soon: true },
  { label: "Internships", to: "/opportunities", soon: true },
  { label: "Graduate Programmes", to: "/opportunities", soon: true },
  { label: "Projects", to: "/build" },
  { label: "Challenges", to: "/build" },
  { label: "Workshops", to: "/events", soon: true },
  { label: "Networking", to: "/connect" },
  { label: "Mentorship", to: "/coming-soon", soon: true },
] satisfies CareerLink[];
