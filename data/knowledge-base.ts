/**
 * Single source of truth for the recruiter assistant.
 * Edit this file to add skills or background not shown on the CV/resume.
 */

export type KnowledgeChunk = {
  id: string;
  title: string;
  tags: string[];
  content: string;
};

export const KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: "identity",
    title: "Identity & contact",
    tags: [
      "name",
      "contact",
      "email",
      "linkedin",
      "github",
      "location",
      "lahore",
      "pakistan",
      "availability",
      "open to work",
      "hire",
      "recruiter",
    ],
    content: `Name: Abdullah Imran
Role: Mid-Level Full-Stack Web Developer
Location: Lahore, Pakistan (31.5°N)
Education: BS Computer Science — University of Central Punjab (UCP), Lahore (2019–2023)
Specialty: Frontend UX + Systems
Availability: Open to work — available for full-time roles and freelance projects
Languages: English, Urdu
Email: abdullah.dev1713@gmail.com
GitHub: https://github.com/abdullah-imran-1713
LinkedIn: https://www.linkedin.com/in/ll-abdullah-imran-ll/
Portfolio: https://abdullah-imran-dev.vercel.app
Resume/CV: Available for download on the portfolio site (/Abdullah-Imran-CV.pdf)`,
  },
  {
    id: "summary",
    title: "Professional summary",
    tags: [
      "summary",
      "about",
      "bio",
      "overview",
      "who",
      "developer",
      "full stack",
      "fullstack",
      "intro",
    ],
    content: `Abdullah Imran is a full-stack web developer who builds scalable, production-grade web platforms — from pixel-level UX to server-side logic and infrastructure.

He ships features for large-scale platforms with hands-on experience across the stack: React/Next.js and Vue/Nuxt on the frontend, Node, Express, and Laravel on the backend, with modern cloud and storage systems.

Core focus areas: React, Next.js, Vue, Node.js, TypeScript, real-time flows, server actions, clean architecture, performance, and code that scales.

Hero positioning: "I build scalable web platforms — end to end." / "Turning hard problems into shipped products."`,
  },
  {
    id: "experience-overview",
    title: "Experience overview",
    tags: [
      "experience",
      "years",
      "timeline",
      "professional",
      "how long",
      "senior",
      "junior",
      "mid",
      "team",
      "agile",
      "scrum",
      "code review",
    ],
    content: `- 2+ years total professional experience
- Simultaneously active at 3 production platforms: HealthShared (May 2025), Lyfetymes (Oct 2025), Quartrly (Dec 2025)
- Employment model: all 3 are contract/freelance engagements
- Not a traditional single full-time employer setup
- Open to full-time employment as well — both models work
- Team size: 2-5 developers per company
- Workflow: team collaboration with informal sprints and standups (not formal Scrum by name)
- Code reviews: both gives and receives regularly
- Managing 3 concurrent production codebases simultaneously`,
  },
  {
    id: "stack-frontend",
    title: "Frontend stack",
    tags: [
      "frontend",
      "react",
      "next",
      "nextjs",
      "vue",
      "nuxt",
      "three",
      "threejs",
      "tailwind",
      "mui",
      "material",
      "zustand",
      "redux",
      "ui",
      "ux",
    ],
    content: `Frontend technologies Abdullah works with:
- Next.js, React.js, Vue.js, Nuxt.js
- Three.js (used in portfolio hero — interactive 3D wireframe)
- Tailwind CSS, Material-UI
- State management: Zustand, Redux`,
  },
  {
    id: "stack-backend",
    title: "Backend stack",
    tags: [
      "backend",
      "node",
      "express",
      "laravel",
      "php",
      "api",
      "rest",
      "server actions",
      "stripe",
      "payments",
    ],
    content: `Backend technologies Abdullah works with:
- Node.js, Express.js
- Laravel (PHP)
- Next.js Server Actions
- REST APIs
- Stripe API (payments integration)`,
  },
  {
    id: "stack-data",
    title: "Languages & databases",
    tags: [
      "typescript",
      "javascript",
      "mongodb",
      "mysql",
      "firestore",
      "redis",
      "database",
      "languages",
      "sql",
      "nosql",
    ],
    content: `Languages & data stores:
- TypeScript, JavaScript
- MongoDB, MySQL, Firestore, Redis`,
  },
  {
    id: "stack-devops",
    title: "Cloud & DevOps",
    tags: [
      "cloud",
      "devops",
      "firebase",
      "aws",
      "s3",
      "docker",
      "ci",
      "git",
      "deploy",
      "infrastructure",
    ],
    content: `Cloud & DevOps:
- Firebase (including Firebase Emulators)
- AWS S3 (media storage pipelines)
- Docker (containerized environments)
- Git, CI workflows`,
  },
  {
    id: "technical-extra",
    title: "Additional technical skills",
    tags: [
      "jwt",
      "authentication",
      "cloudinary",
      "figma",
      "html",
      "css",
      "responsive",
      "figma to code",
      "auth",
      "image upload",
      "mobile first",
    ],
    content: `- JWT: built full authentication system in personal projects (login, protected routes, token handling)
- Cloudinary: used for image upload pipeline in projects
- Figma to Code: regularly converts Figma designs to production-ready UI
- HTML/CSS: advanced level — custom design systems, responsive layouts, mobile-first approach
- Responsive design: all projects built mobile-first`,
  },
  {
    id: "healthshared",
    title: "HealthShared experience",
    tags: [
      "healthshared",
      "health",
      "work",
      "experience",
      "job",
      "current",
      "firebase",
      "gamification",
      "questionnaire",
    ],
    content: `HealthShared — Full-Stack Developer (May 2025 — Present)
URL: https://health-shared.com
Type: Health community platform — production features across the stack

Key contributions:
- Engineered a complete season-based questionnaire system with progress tracking, validation logic, and dynamic UI rendering
- Implemented gamification architecture — badges, achievements, leaderboards — with optimized state and database sync
- Developed secure server-side actions and API logic with strict TypeScript typing and data validation
- Solved complex SSR hydration and lifecycle issues, improving performance and stability
- Designed Firestore schema updates and backward-compatible migrations without breaking live data

Stack: Next.js, React, TypeScript, Firebase, Tailwind, Zustand`,
  },
  {
    id: "lyfetymes",
    title: "Lyfetymes experience",
    tags: [
      "lyfetymes",
      "event",
      "events",
      "vue",
      "laravel",
      "stripe",
      "rsvp",
      "work",
      "experience",
      "template",
    ],
    content: `Lyfetymes — Full-Stack Developer (Oct 2025 — Present)
URL: https://www.lyfetymes.com
Type: Event-management platform — celebration templates

What Abdullah actually did (honest, defensible):

Main achievement — Re-architecture:
- Migrated a per-element click-to-style customization engine (~300 lines of computed styles, click handlers, refs) from one branch to another, AND converted it from a host-facing feature into an admin-only template builder — a deliberate architectural shift, not just copy-paste

- Made the previously non-functional admin template creation flow fully working (migrations were broken — manually created templates table and fixed NOT NULL constraint via phpMyAdmin, then made /backend/templates flow end-to-end)

- Extended per-element click-to-style system across all webpage elements (Share Memories Button, Contact Info Buttons, Venue Section, Additional Notes) — each element: click → sidebar panel (font, color, border, padding, margin, shape)

Tricky bug fixed:
- "Make Round" circle centering — element became circle but inner content stuck at top. Root cause: Bootstrap's d-inline-block class applying display:inline-block !important, overriding inline-flex centering even with !important inline styles. Fix: conditionally removed that Bootstrap class in circle mode.

Legacy stack challenge:
- Laravel 5.5, webpack 3, Node 14 (OpenSSL legacy flag), broken migrations (every DB change via direct phpMyAdmin SQL), --legacy-peer-deps on every install, Lucide icons incompatible (inline SVG only)
- Modern tooling did not work — everything handled manually

Built full RSVP management system with validation and structured data flows
Refactored permissions into scalable RBAC architecture
Improved system maintainability via modular components and clean API integrations

Stack: Vue.js 2, Laravel, MySQL, AWS S3, reCAPTCHA v3`,
  },
  {
    id: "quartrly",
    title: "Quartrly experience",
    tags: [
      "quartrly",
      "scheduling",
      "quarterly",
      "node",
      "mongodb",
      "redis",
      "docker",
      "work",
      "experience",
      "onboarding",
    ],
    content: `Quartrly — Full-Stack Developer (Dec 2025 — Present)
URL: https://www.quartrly.com
Type: Quarterly scheduling app — real-time availability

Strongest achievement — Signup flow integrity:
- Re-architected multi-step onboarding flow to eliminate client-side race conditions and infinite redirect loops
- Problem: code relied on implicit field-value checks (if data.person_type.length === 0) — localStorage update and redirect timing gap caused infinite loops
- Fix: replaced fragile field-value validation with an explicit completed_steps array as single source of truth
- Result: sequential step enforcement, URL-bypass prevention (route guards), and crash-recovery state persistence — user can leave halfway and resume from correct step
- This is "derive state from field value" vs "track state explicitly" — a deliberate engineering decision

Availability/scheduling UI:
- Built 15-minute interval slot selection UI (4 slots/hour)
- Mobile layout fixes and availability prompt redirect logic
- Dialog and UI consistency standardization across flows

S3 upload pipeline debugging:
- Debugged and fixed broken S3 presigned-URL image upload
- Fixed 403 errors by removing restricted ACLs from presigned POST policy
- Configured S3 CORS and bucket policies for localhost + prod
- Tuned URL expiry (60s → 600s) for client-side crop/compress
- Added proper upload-failure error handling on frontend

Infrastructure setup:
- Docker containerized MongoDB + Redis environment
- Environment configuration for consistent local/prod deploys
- Node 12 environment setup

Stack: React, Redux, Node.js, Express, MongoDB, Redis, AWS S3, Docker, Material-UI`,
  },
  {
    id: "project-agri-robot",
    title: "AI Agricultural Robot — Final Year Project",
    tags: [
      "university",
      "project",
      "fyp",
      "AI",
      "machine learning",
      "react",
      "node",
      "robot",
      "geolocation",
      "final year",
      "computer vision",
      "web portal",
    ],
    content: `- Led development of AI-based agricultural robot for automated pesticide spraying using image recognition + ML
- Integrated PLC and DC motors for reliable movement control
- Implemented image recognition for spraying decisions
- Built secure React/Node web portal with geolocation tracking, live telemetry, and user feedback mechanisms
- Type: University Final Year Project (UCP, 2023) — not commercial/production work`,
  },
  {
    id: "github",
    title: "GitHub activity",
    tags: [
      "github",
      "open source",
      "contributions",
      "activity",
      "repos",
      "code",
      "commits",
    ],
    content: `GitHub username: abdullah-imran-1713
Profile: https://github.com/abdullah-imran-1713

The portfolio displays live GitHub data when configured: contribution graph, language breakdown, repository stats, and activity radar (commits, PRs, issues, code reviews). Abdullah maintains active development activity on GitHub.`,
  },
  {
    id: "preferences",
    title: "Work preferences",
    tags: [
      "remote",
      "freelance",
      "full time",
      "contract",
      "relocate",
      "visa",
      "salary",
      "notice",
      "preferences",
      "role",
    ],
    content: `- Open to full-time and freelance/contract work — both equally
- Remote strongly preferred; based in Lahore, Pakistan
- Preferred stack: React/Next.js + TypeScript primary; Vue/Laravel also available (production experience in both)
- Company preference: Startups and small teams preferred based on experience; open to agencies and mid-size companies
- Notice period: discuss privately via email
- Compensation: depends on role scope, location, and employment type — discuss directly with Abdullah at abdullah.dev1713@gmail.com`,
  },
  {
    id: "recruiter-tips",
    title: "Recruiter quick reference",
    tags: [
      "recruiter",
      "hiring",
      "fit",
      "match",
      "senior",
      "junior",
      "mid",
      "stack match",
      "pitch",
      "summary",
    ],
    content: `Quick recruiter reference:

Best fit roles: Full-Stack Developer, Frontend-heavy Full-Stack, React/Next.js Developer, Vue Full-Stack

Strongest signals:
- Production experience across 3 active platforms (health, events, scheduling)
- Payments (Stripe), RBAC, real-time scheduling, gamification, SSR/performance
- TypeScript across modern React and Next.js stacks

Stack match examples:
- React/Next/TypeScript role → HealthShared + Quartrly experience
- Vue/Laravel role → Lyfetymes experience
- Node/MongoDB role → Quartrly experience

Best/flagship project: HealthShared — most complex stack, gamification architecture, SSR performance, Firebase, TypeScript production work
Primary stack signal: React/Next.js + TypeScript + Node
Secondary stack signal: Vue.js + Laravel (production at Lyfetymes)

To reach Abdullah: email abdullah.dev1713@gmail.com or LinkedIn.`,
  },
  {
    id: "git-workflow",
    title: "Git & GitHub workflow",
    tags: [
      "git",
      "github",
      "branches",
      "pull request",
      "PR",
      "code review",
      "merge",
      "CI",
      "workflow",
      "daily",
    ],
    content: `- Uses Git daily across all 3 production codebases
- Feature branch workflow with Pull Requests
- Code reviews: both gives and receives regularly
- Merge conflict resolution
- GitHub Actions basics for CI workflows
- Production deployments via Git-based pipelines`,
  },
  {
    id: "deployment",
    title: "Deployment experience",
    tags: [
      "deploy",
      "vercel",
      "netlify",
      "firebase",
      "docker",
      "production",
      "hosting",
      "CI/CD",
      "live",
    ],
    content: `- Vercel: Next.js projects (including own portfolio)
- Netlify: frontend deployments
- Docker: containerized database environments (Quartrly)
- Firebase Hosting: Firebase-based projects
- Has deployed to production independently across multiple projects`,
  },
  {
    id: "performance",
    title: "Performance optimization",
    tags: [
      "performance",
      "optimization",
      "SSR",
      "hydration",
      "parallel",
      "promise",
      "firestore",
      "caching",
      "speed",
    ],
    content: `- Diagnosed and fixed a production-only stale-state bug in Next.js 15 App Router caused by Full Route Cache serving outdated server-rendered snapshots. Fixed with targeted revalidatePath() cache invalidation in server actions. Also caught a second action with the same latent issue.
- Optimized server-side data access by converting independent sequential Firestore reads to parallel Promise.all() calls across multiple Cloud Functions and server actions — roughly halving response time on affected paths and eliminating timeout risk on heavy-user data operations.
- SSR parallel data fetching in server components`,
  },
  {
    id: "api-experience",
    title: "API design and integration",
    tags: [
      "api",
      "rest",
      "third party",
      "integration",
      "stripe",
      "lemon squeezy",
      "webhook",
      "payment",
      "recaptcha",
    ],
    content: `- Designed and built REST APIs (Node/Express, Laravel)
- Consumed third-party APIs: GitHub API, reCAPTCHA v3
- Built SaaS subscription payments using Lemon Squeezy (checkout + webhooks) in personal project LetzPlay
- API validation, error handling, structured responses
- Next.js Server Actions for server-side logic
- Secure API routes with authentication and rate limiting`,
  },
  {
    id: "testing",
    title: "Testing approach",
    tags: ["testing", "QA", "manual", "test", "quality"],
    content: `- Manual testing across all production environments
- No formal Jest/Cypress test suite currently
- TypeScript strict typing used as primary quality layer
- Code reviews as collaborative quality assurance`,
  },
  {
    id: "new-skills",
    title: "Recently learned skills (last 6 months)",
    tags: [
      "cloud functions",
      "firebase functions",
      "serverless",
      "gdpr",
      "privacy",
      "data rights",
      "new",
      "learned",
      "growing",
      "fast learner",
    ],
    content: `- Firebase Cloud Functions architecture: stateless container model, callable vs scheduled vs trigger functions, correct httpsCallable() invocation pattern — now applies confidently across production codebase
- GDPR data-rights engineering (Articles 15-22): built end-to-end system including data export with single-use secure download proxy, step-up authentication, and fail-closed account-deletion pipeline fanning out across multiple Firestore collections
- Privacy/compliance engineering — a niche skill most developers do not have`,
  },
  {
    id: "achievements",
    title: "Key achievements",
    tags: [
      "achievement",
      "impact",
      "accomplishment",
      "shipped",
      "best work",
      "proud",
      "highlight",
      "production",
    ],
    content: `- Simultaneously contributing to 3 active international production platforms (HealthShared UK, Lyfetymes, Quartrly)
- Fixed production-only Next.js Full Route Cache bug that only reproduced in production, not localhost
- Optimized Firestore parallel reads — roughly halved response time on affected paths
- Built complete GDPR data-rights system (Articles 15-22)
- Engineered gamification architecture from scratch (HealthShared)
- Built SaaS subscription payment integration (Lemon Squeezy)
- Designed scalable RBAC permission systems (Lyfetymes)
- Built AI agricultural robot + web portal (Final Year Project)
- Deployed projects independently to Vercel and Netlify`,
  },
  {
    id: "client-communication",
    title: "Client and team communication",
    tags: [
      "client",
      "communication",
      "international",
      "english",
      "remote",
      "async",
      "team",
      "collaboration",
    ],
    content: `- Direct communication with HealthShared founder/owner
- Works with Team Leads at Lyfetymes and Quartrly
- All 3 platforms are international (not local Pakistani clients)
- Professional async remote communication in English
- Comfortable working across different time zones and teams`,
  },
  {
    id: "leadership",
    title: "Collaboration and growth",
    tags: [
      "mentor",
      "junior",
      "leadership",
      "team",
      "collaboration",
      "code review",
      "feedback",
      "growth",
    ],
    content: `- No formal mentoring role yet
- Regularly participates in code reviews — giving and receiving
- Active technical discussions within small teams (2-5 devs)
- Managing 3 concurrent production codebases independently
- Fast learner — picked up Firebase Cloud Functions architecture and GDPR engineering within months`,
  },
  {
    id: "faq-recruiter",
    title: "Recruiter FAQ",
    tags: [
      "faq",
      "recruiter",
      "interview",
      "questions",
      "common",
      "hire",
      "fit",
      "existing code",
      "from scratch",
    ],
    content: `Q: What are Abdullah's strongest skills?
A: React, Next.js, TypeScript, Node.js, system design, and frontend performance optimization.

Q: Is he frontend or full-stack?
A: Full-stack with strong frontend specialization.

Q: Does he work well in teams?
A: Yes — 2-5 developer teams, code reviews, informal sprints and standups across 3 companies.

Q: Can he handle existing codebases?
A: Yes — all 3 current jobs involve joining and improving live production codebases.

Q: Is he open to remote work?
A: Yes — strongly prefers remote.

Q: What is his flagship project?
A: HealthShared — most complex stack, gamification architecture, SSR optimization, Firebase, TypeScript.

Q: Is he open to full-time and freelance both?
A: Yes — open to both equally.

Q: What company types does he prefer?
A: Startups and small teams primarily, open to agencies.

Q: Does he have international experience?
A: Yes — all 3 current platforms are international products.

Q: Can he start immediately?
A: Notice period — discuss privately via email.

Q: Does he write tests?
A: Manual testing in production; relies on TypeScript strict typing and code reviews for quality assurance.`,
  },
  {
    id: "seniority-level",
    title: "Experience level and seniority",
    tags: [
      "junior",
      "mid",
      "senior",
      "level",
      "seniority",
      "years",
      "experience level",
      "mid-level",
    ],
    content: `Current level: Mid-level Full-Stack Developer
- 2+ years professional experience
- Simultaneously maintaining 3 production codebases
- Has diagnosed and fixed production-only bugs independently
- Comfortable owning features end-to-end across stack
- Not claiming: staff/architect level, large-scale team leadership, or formal senior engineer title
- Best described as: strong mid-level developer with senior-leaning ownership and problem-solving ability`,
  },
  {
    id: "availability-timezone",
    title: "Timezone and availability",
    tags: [
      "timezone",
      "hours",
      "overlap",
      "PKT",
      "UTC",
      "availability",
      "when",
      "schedule",
      "working hours",
      "async",
      "US",
      "UK",
      "Europe",
    ],
    content: `- Based in Lahore, Pakistan — PKT (UTC+5)
- Working hours: flexible — can provide overlap with US, UK, and European teams
- Comfortable with async-first remote workflows
- Currently working with international teams across different timezones (HealthShared UK, Lyfetymes, Quartrly)`,
  },
  {
    id: "dsa-algorithms",
    title: "DSA and algorithms",
    tags: [
      "dsa",
      "algorithms",
      "data structures",
      "leetcode",
      "problem solving",
      "computer science",
      "coding test",
      "technical interview",
      "whiteboard",
    ],
    content: `- Intermediate level — comfortable with common data structures and algorithms (arrays, hashmaps, trees, sorting, basic graph traversal)
- Leetcode medium level problems
- CS fundamentals from BS Computer Science (UCP, 2019-2023)
- Primary strength is practical/production engineering rather than competitive programming
- Can handle standard technical screening rounds`,
  },
  {
    id: "limitations",
    title: "Honest scope — what is not claimed",
    tags: [
      "limitations",
      "honest",
      "scope",
      "not claimed",
      "kubernetes",
      "testing",
      "senior",
      "architect",
      "leadership",
      "team lead",
    ],
    content: `Honest boundaries — Abdullah does not claim:
- Formal senior engineer or staff/architect title
- Large-scale team leadership or management experience
- Extensive automated testing (Jest/Cypress) experience
- Kubernetes expertise
- DSA/competitive programming at advanced level
- Formal Scrum Master or Agile certification

This ensures the assistant never over-sells.
For anything outside this scope, recruiter should contact Abdullah directly at abdullah.dev1713@gmail.com`,
  },
  {
    id: "system-design",
    title: "System design exposure",
    tags: [
      "system design",
      "architecture",
      "scalable",
      "design",
      "scalability",
      "distributed",
      "cache",
      "RBAC",
      "onboarding",
      "scheduling",
      "gamification",
    ],
    content: `System design areas Abdullah has hands-on exposure to:
- RBAC (Role-Based Access Control) systems — Lyfetymes
- Multi-step onboarding flow architecture with state machine pattern — Quartrly
- Gamification systems (badges, achievements, leaderboards, idempotency) — HealthShared
- Real-time scheduling UI with slot management — Quartrly
- REST API architecture and design — across all 3 platforms
- Cloud storage pipelines (S3 presigned URLs) — Quartrly
- Cache invalidation strategies (Next.js Full Route Cache, revalidatePath) — HealthShared
- Firestore schema design and backward-compatible migrations
- Serverless Cloud Functions architecture (stateless container model, callable vs scheduled vs trigger)
- GDPR data-rights pipeline architecture (Articles 15-22)

Note: exposure is through production feature work, not formal system design interviews or staff-level architecture.`,
  },
  {
    id: "assistant-rules",
    title: "Assistant response rules",
    tags: [
      "rules",
      "guidelines",
      "assistant",
      "boundaries",
      "hallucination",
      "accuracy",
    ],
    content: `STRICT RULES for this assistant:
- Only answer from documented experience in this knowledge base
- Do NOT claim technologies not explicitly listed
- Do NOT invent certifications or qualifications
- Do NOT invent leadership or management experience
- Do NOT upgrade seniority level beyond mid-level
- If information is unavailable, say:
  "I don't have that detail — please contact Abdullah directly at abdullah.dev1713@gmail.com"
- Never make up project names, companies, or achievements
- When in doubt, refer recruiter to direct contact`,
  },
  {
    id: "ai-llm-experience",
    title: "AI/LLM experience and AI development tools",
    tags: [
      "ai",
      "llm",
      "openai",
      "claude",
      "chatbot",
      "RAG",
      "artificial intelligence",
      "machine learning",
      "bot",
      "groq",
      "gemini",
      "ai integration",
      "cursor",
      "copilot",
      "ai tools",
      "coding tools",
      "ai assisted",
      "development tools",
    ],
    content: `AI/LLM experience — early stage but genuine:

First implementation:
- Built this portfolio recruiter assistant (the bot you are talking to right now) — Abdullah's first LLM integration
- Stack: Groq API (Llama 3.1), custom RAG-style retrieval from knowledge base, rate limiting, strict system prompt, Next.js API route
- Shows: API integration, prompt engineering, grounded retrieval, responsible AI (no hallucination by design)

Prior AI exposure:
- AI Agricultural Robot (FYP, 2023) — image recognition and ML for automated pesticide spraying decisions

Plans:
- Actively planning to add AI features to personal projects
- LetzPlay (SaaS gaming platform) has planned AI integration

AI tools for development:
- Uses Cursor AI for development workflow
- Comfortable using AI-assisted coding tools
- Uses AI tools for productivity, not as a crutch — understands the code he ships

Honest assessment:
- Not an AI/ML engineer
- Can integrate LLM APIs, build AI-powered features, and design grounded retrieval systems
- Fast-growing area for Abdullah — first integration already shipped (this assistant)`,
  },
  // ─── Supplemental background (not on formal CV — edit freely) ───
  {
    id: "supplemental-blender",
    title: "Blender & 3D (supplemental)",
    tags: [
      "blender",
      "3d",
      "modeling",
      "graphics",
      "animation",
      "creative",
      "side project",
      "hobby",
    ],
    content: `Blender (3D) — supplemental, NOT on formal CV/resume:
Abdullah has done some personal work with Blender (basic to intermediate exposure). This includes familiarity with 3D modeling fundamentals, scene setup, and exploring 3D workflows outside his primary web development career.

This is a side skill / personal interest, not professional production experience. His main 3D-related professional work is Three.js on the web (portfolio hero uses a custom Three.js wireframe scene).

If asked about Blender: yes, he has some experience, but it is not a core hiring skill — web/full-stack development is his primary focus.`,
  },
  {
    id: "supplemental-other",
    title: "Additional background (supplemental)",
    tags: [
      "other",
      "additional",
      "extra",
      "beyond cv",
      "personal",
      "interests",
      "soft skills",
    ],
    content: `Additional context (supplemental — edit this section in data/knowledge-base.ts as needed):

- Portfolio built with Next.js 14, TypeScript, custom CSS design system, and Three.js hero
- Cares deeply about UX polish, performance, SSR stability, and maintainable architecture
- Comfortable working across multiple codebases simultaneously (currently active at HealthShared, Lyfetymes, and Quartrly)
- Communication: professional English; based in Lahore, Pakistan

To add more supplemental facts (certifications, university projects, languages spoken, etc.), update data/knowledge-base.ts on the portfolio repo.`,
  },
];

export const SUGGESTED_PROMPTS = [
  "Summarize Abdullah's experience for a full-stack role",
  "What is his best production project?",
  "Does he know JWT or authentication systems?",
  "Can he convert Figma designs to code?",
  "Is he open to remote work?",
  "Which role best matches React + Next.js?",
  "What has he shipped at HealthShared?",
  "How does he handle multiple projects simultaneously?",
];
