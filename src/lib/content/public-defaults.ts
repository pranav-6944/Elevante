export interface CapabilityItem {
  id: string;
  title: string;
  category: string;
  description: string;
  iconKey:
    | "globe"
    | "box"
    | "smartphone"
    | "bar-chart"
    | "table"
    | "sparkles"
    | "pen-tool"
    | "layers"
    | "file-text";
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface AdvantageItem {
  title: string;
  description: string;
}

export interface FounderProfile {
  name: string;
  role: string;
  initials: string;
  focus: string;
  summary: string;
}

export interface FaqEntry {
  id: string;
  category: "Workflow & Quotations" | "Services & Delivery" | "Security & Ownership";
  question: string;
  answer: string;
}

export const AGENCY_CONTACT = {
  email: "pranavlamkhade21@gmail.com",
  location: "Pune, Maharashtra, India",
  responseSla: "Within 1–2 business days",
} as const;

export const CAPABILITIES: CapabilityItem[] = [
  {
    id: "website-development",
    title: "Website Development",
    category: "Web Engineering",
    description:
      "Fast, accessible, SEO-ready websites built with Next.js, TypeScript, and modern server-first architecture.",
    iconKey: "globe",
  },
  {
    id: "3d-web-experiences",
    title: "3D Web Experiences",
    category: "Interactive Web",
    description:
      "Purposeful Three.js and React Three Fiber scenes engineered with graceful mobile fallbacks and strong Core Web Vitals.",
    iconKey: "box",
  },
  {
    id: "application-development",
    title: "Application Development",
    category: "Full-Stack Platforms",
    description:
      "Production client portals, internal dashboards, and relational SaaS systems backed by PostgreSQL and role-based security.",
    iconKey: "smartphone",
  },
  {
    id: "data-analytics",
    title: "Data Analytics",
    category: "Data & Insights",
    description:
      "Structured reporting pipelines, operational KPI dashboards, and decision-ready analysis tailored to business metrics.",
    iconKey: "bar-chart",
  },
  {
    id: "excel-csv-automation",
    title: "Excel & CSV Automation",
    category: "Operations Automation",
    description:
      "Automated cleaning, validation, transformation, and repeatable reporting workflows that replace error-prone manual spreadsheets.",
    iconKey: "table",
  },
  {
    id: "ai-solutions",
    title: "AI Solutions",
    category: "Applied AI",
    description:
      "Practical AI integrations, knowledge retrieval systems, and workflow assistants designed with strict data boundaries.",
    iconKey: "sparkles",
  },
  {
    id: "logo-design",
    title: "Logo Design",
    category: "Brand Identity",
    description:
      "Distinctive, scalable brand marks engineered for print, web, favicons, and crisp responsive vector usage.",
    iconKey: "pen-tool",
  },
  {
    id: "branding",
    title: "Branding Systems",
    category: "Brand Identity",
    description:
      "Cohesive color palettes, typography hierarchies, and visual guidelines that establish immediate customer trust.",
    iconKey: "layers",
  },
  {
    id: "document-presentation-design",
    title: "Document & Presentation Design",
    category: "Executive Collateral",
    description:
      "Investor pitch decks, technical proposals, and structured business documents built for clarity and persuasion.",
    iconKey: "file-text",
  },
];

export const TECHNOLOGY_STACK = [
  "Next.js (App Router)",
  "React & TypeScript",
  "Tailwind CSS & shadcn/ui",
  "Three.js & Motion",
  "Supabase PostgreSQL",
  "Zod Validation",
  "Python & Data Pipelines",
  "Resend Email Delivery",
] as const;

export const WORKFLOW_STAGES: ProcessStep[] = [
  {
    step: "01",
    title: "Explore & Submit Brief",
    description:
      "Select a service, complete tailored requirement fields, and attach reference documents or brand assets securely.",
  },
  {
    step: "02",
    title: "Review & Clarification",
    description:
      "Our team evaluates scope, timelines, and technical constraints, requesting targeted clarifications where needed.",
  },
  {
    step: "03",
    title: "Transparent Quotation",
    description:
      "Receive an itemized quotation outlining deliverables, milestones, timeline, and terms before any work begins.",
  },
  {
    step: "04",
    title: "Build, Track & Deliver",
    description:
      "Track every status change, collaborate in one project thread, and download final verified deliverables upon completion.",
  },
];

export const WHY_CHOOSE_ELEVANTE: AdvantageItem[] = [
  {
    title: "Production Architecture Over Templates",
    description:
      "Every web platform and client system is built with server-side validation, clean relational data models, and maintainable TypeScript.",
  },
  {
    title: "Engineering + Design Under One Roof",
    description:
      "From brand identity and executive decks to full-stack web apps and AI workflows, strategy and execution stay tightly aligned.",
  },
  {
    title: "Clear Quotation-First Engagement",
    description:
      "You review exact scope, deliverables, and timelines through structured quotations—no guesswork or hidden surprises.",
  },
  {
    title: "Search, Speed & Accessibility Built In",
    description:
      "Semantic HTML, Schema.org metadata, responsive mobile layouts, and Core Web Vitals optimization are treated as baseline standards.",
  },
];

export const FOUNDERS: FounderProfile[] = [
  {
    name: "Pranav Lamkhade",
    role: "Founder",
    initials: "PL",
    focus: "Full-Stack Architecture, Web Engineering & Data/AI Systems",
    summary:
      "Leads technical architecture, full-stack web platforms, database engineering, and AI/analytics solutions at ELEVANTE with a focus on security and long-term maintainability.",
  },
  {
    name: "Omkar Sable",
    role: "Co-Founder",
    initials: "OS",
    focus: "Digital Strategy, Client Delivery & Brand Experience",
    summary:
      "Co-leads agency operations, client discovery, visual presentation, and cross-disciplinary execution so every engagement delivers measurable business clarity.",
  },
];

export const PUBLIC_FAQS: FaqEntry[] = [
  {
    id: "how-projects-start",
    category: "Workflow & Quotations",
    question: "How does starting a project with ELEVANTE work?",
    answer:
      "You begin by exploring a service or sending an enquiry, sharing your goals and any reference files. We review your requirements, clarify open questions, and issue a structured quotation with deliverables, timeline, and terms before execution starts.",
  },
  {
    id: "upfront-payments",
    category: "Workflow & Quotations",
    question: "Do I pay online before receiving a scope review?",
    answer:
      "No. ELEVANTE operates on a quotation-first workflow so scope, deliverables, and timelines are reviewed and agreed upon clearly before project work is scheduled.",
  },
  {
    id: "services-offered",
    category: "Services & Delivery",
    question: "What digital solutions does ELEVANTE provide?",
    answer:
      "ELEVANTE provides website development, 3D web experiences, full-stack web application development, data analytics, Excel/CSV automation, AI solutions, logo design, branding systems, and document and presentation design.",
  },
  {
    id: "project-tracking",
    category: "Services & Delivery",
    question: "How do clients track progress and receive final deliverables?",
    answer:
      "Once the Client Portal is active, each project maintains a recorded status history, direct client-agency messaging, reference uploads, and permissioned deliverable downloads in a single workspace.",
  },
  {
    id: "file-security",
    category: "Security & Ownership",
    question: "How are uploaded reference files and deliverables kept private?",
    answer:
      "Client reference attachments and project deliverables are stored in private, access-controlled storage buckets and accessed through short-lived, authorized signed links scoped strictly to your account and assigned team members.",
  },
  {
    id: "seo-mobile-standards",
    category: "Security & Ownership",
    question: "Are ELEVANTE websites optimized for mobile performance and search visibility?",
    answer:
      "Yes. We build mobile-responsive layouts using server-rendered HTML, clean URL structures, Schema.org structured data, accessible semantics, and minimal client-side JavaScript for strong Core Web Vitals.",
  },
];

export const PRIVACY_SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "When you submit a contact enquiry, register for the Client Portal, or request a project quotation, ELEVANTE collects information you directly provide, including your name, email address, phone number, company name, project requirements, and uploaded reference files.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information strictly to evaluate project enquiries, prepare quotations, communicate regarding active engagements, deliver project files, maintain security and audit trails, and send essential transactional notifications.",
  },
  {
    title: "3. Data Isolation & File Protection",
    body: "Client accounts, project briefs, messages, and deliverables are protected through server-side authorization checks and database Row Level Security policies. Private project files are stored separately from public website media and served only via authorized short-lived links.",
  },
  {
    title: "4. Third-Party Infrastructure",
    body: "ELEVANTE operates on managed cloud infrastructure including Vercel (application hosting), Supabase (PostgreSQL database, authentication, and file storage), and Resend (transactional email delivery). We do not sell customer data to third parties.",
  },
  {
    title: "5. Retention & Contact",
    body: "Project records and deliverables are retained to support ongoing client access, revision history, and legal compliance. To request updates or deletion of your account information, contact us at pranavlamkhade21@gmail.com.",
  },
];

export const TERMS_SECTIONS = [
  {
    title: "1. Scope & Quotation-Based Engagement",
    body: "Submitting an enquiry or project brief through ELEVANTE initiates a scope review and does not constitute a binding service contract until ELEVANTE issues a written quotation and both parties confirm agreement on scope, timeline, and fees.",
  },
  {
    title: "2. Client Responsibilities & Reference Materials",
    body: "Clients agree to provide accurate project requirements, timely feedback during clarification and review stages, and only upload reference files, brand assets, or data they have lawful authority to share.",
  },
  {
    title: "3. Deliverables & Revisions",
    body: "Deliverables, milestone schedules, and included revision rounds are defined per project in the approved quotation. Requests beyond the agreed scope may require an updated quotation revision prior to execution.",
  },
  {
    title: "4. Intellectual Property",
    body: "Upon completion and settlement of agreed engagement terms, ownership or licensing of custom project deliverables transfers to the client as specified in the project quotation, excluding reusable open-source libraries and pre-existing agency tooling.",
  },
  {
    title: "5. Platform Acceptable Use",
    body: "Users must not attempt unauthorized access to other customer accounts, probe private endpoints, upload malicious files, or disrupt platform availability. Accounts violating security boundaries may be suspended immediately.",
  },
];
