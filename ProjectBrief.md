# Project Brief: ELEVANTE — Digital Solutions Agency Platform

Build **ELEVANTE**, a production-ready, full-stack digital agency website and service-management platform.

Elevante is a digital solutions agency founded by Pranav Lamkhade, with Omkar Sable as co-founder. The agency provides website development, 3D web experiences, application development, data analytics, Excel/CSV automation, AI solutions, logo design, branding, and professional document and presentation design.

This is a real business project that will eventually be deployed and used by actual customers. It is NOT a demo, static portfolio, or simple landing page. Build it with production-level architecture, security, scalability, maintainability, and performance in mind. The platform should be capable of supporting thousands of visitors and growing customer and project records.

## 1. Technology Stack

Use a modern, production-ready technology stack:

- **Frontend:** Next.js (App Router), React, TypeScript.
- **Styling:** Tailwind CSS and shadcn/ui.
- **Animations:** Motion for React, with Three.js / React Three Fiber where genuinely useful.
- **Backend:** Next.js Server Actions and Route Handlers.
- **Database:** Supabase PostgreSQL.
- **Authentication:** Supabase Auth.
- **File Storage:** Supabase Storage.
- **Validation:** Zod and React Hook Form.
- **Email:** Resend.
- **Icons:** Lucide React and custom SVG illustrations.
- **Deployment:** Vercel with Supabase as the backend platform.
- **Version Control:** Git and GitHub.

Use clean, reusable, modular components and a clear separation of responsibilities. Avoid unnecessary dependencies and duplicated logic.

## 2. Brand Identity and Color Scheme

Use the official Elevante logo and maintain its visual identity throughout the platform.

Primary brand gradient:

`linear-gradient(100deg, #17264F 0%, #245B70 52%, #319C78 100%)`

Supporting colors:
- Deep Navy: `#17264F`
- Teal Blue: `#245B70`
- Growth Green: `#319C78`
- Warm Off-White: `#F5F6F2`
- White: `#FFFFFF`

Create a premium, modern, technology-focused visual experience. Use the brand gradient strategically for buttons, highlights, decorative elements, and selected backgrounds.

## 3. Public Website

Create an attractive, high-quality landing page that immediately communicates what Elevante does.

Include:

- Navigation bar with responsive mobile navigation.
- Visually impressive hero section with a strong headline, supporting description, and clear calls to action.
- Animated brand elements and carefully designed visual effects.
- Agency introduction.
- Services and categories.
- Featured portfolio projects.
- Technologies and capabilities.
- How the agency works.
- Why choose Elevante.
- Founder and co-founder section.
- Testimonials.
- Frequently asked questions.
- Contact section.
- Professional footer.

Create additional pages for:
- Home
- About
- Services
- Individual service details
- Portfolio and individual projects
- Contact
- FAQ
- Privacy Policy
- Terms and Conditions

The design should feel premium, distinctive, responsive, and trustworthy. Avoid generic templates and excessive animations. Prioritize excellent mobile performance.

## 4. Service Management

Build a dynamic service catalog backed by the database.

Customers should be able to:
- Browse service categories.
- Search and filter services.
- View individual service details.
- Understand deliverables, features, timelines, and pricing information where available.
- Submit project requirements.
- Upload reference files.

Administrators should be able to add, edit, delete, publish, unpublish, and organize categories and services without modifying source code.

Build a dynamic service-specific form system so each service can have its own requirements and input fields.

## 5. Customer Accounts and Dashboard

Implement secure customer registration, login, email verification, password recovery, and account management.

Each customer should have a dashboard to:
- View their profile.
- Submit new project requests.
- Track project status.
- View quotations.
- Communicate with the agency.
- Upload and access project files.
- Download completed deliverables.
- View notifications.
- Access previous orders and project history.

Customers must only be able to access their own records and files.

## 6. Admin Dashboard

Build a separate, secure administrative dashboard.

Include:
- Dashboard overview and statistics.
- Customer management.
- Service and category management.
- Dynamic service form builder.
- Project and order management.
- Enquiry management.
- Quotation management.
- Portfolio management.
- Testimonials and FAQ management.
- Website content management.
- Image and video management.
- File and deliverable management.
- Team management and role permissions.
- Analytics and reports.
- Notifications.
- Audit logs.
- Platform settings.

Administrators should be able to manage routine website content, including headings, descriptions, images, videos, sections, and service information through the admin interface.

Implement proper role-based access control. Never rely on frontend visibility alone to protect administrative functionality.

## 7. Project and Order Workflow

Implement a logical agency workflow:

1. Customer explores services.
2. Customer selects a service.
3. Customer fills out the relevant project requirements.
4. Customer uploads reference files.
5. Customer submits a project request.
6. Admin reviews the request.
7. Admin requests clarification if required.
8. Admin prepares and sends a quotation.
9. Customer reviews the quotation.
10. Admin updates the project status after agreement.
11. Agency works on the project.
12. Admin uploads deliverables.
13. Customer accesses the completed project files.
14. Project is marked completed.

Use clearly defined statuses and maintain a history of important status changes.

The initial platform should use a quotation-based workflow. Do not implement fake payment functionality. Keep the architecture ready for future payment gateway integration.

## 8. Database and File Storage

Use Supabase PostgreSQL as the central relational database.

Design a proper relational schema for:

- User profiles.
- User roles and permissions.
- Service categories.
- Services.
- Service-specific form fields.
- Project requests and orders.
- Customer form responses.
- Quotations.
- Project status history.
- Customer and admin messages.
- Notifications.
- Uploaded files.
- Deliverables.
- Portfolio projects.
- Testimonials.
- FAQs.
- Website content.
- Team members.
- Audit logs.
- Future payment records.

Use Supabase Storage for images, videos, reference files, project attachments, and deliverables. Store file metadata and storage paths in PostgreSQL rather than storing large binary files directly in database rows.

Implement proper relationships, indexes, constraints, migrations, and Row Level Security policies.

Do not store passwords, secret keys, or sensitive credentials in plain text. Use Supabase Auth and secure environment variables.

## 9. SEO, AEO, and GEO

Build the website with search visibility as a core requirement.

**SEO:**
- Server-rendered and statically generated pages where appropriate.
- Unique page titles and meta descriptions.
- Canonical URLs.
- XML sitemap.
- Robots.txt.
- Open Graph and social sharing metadata.
- Semantic HTML.
- Structured data using appropriate Schema.org types.
- Optimized images and descriptive alt text.
- Clean URLs and internal linking.
- Core Web Vitals optimization.

**AEO (Answer Engine Optimization):**
- Clear, direct answers to common customer questions.
- Well-structured headings.
- FAQ sections and appropriate FAQ structured data.
- Useful service descriptions.
- Content written to answer real customer search queries.

**GEO (Generative Engine Optimization):**
- Consistent and factual agency information.
- Clearly explained services and capabilities.
- Structured, understandable content.
- Accurate organization and founder information.
- Authoritative project descriptions and useful FAQs.

Do not use misleading structured data, keyword stuffing, fake reviews, or fabricated business information. SEO metadata and public content should be manageable through the admin panel where appropriate.

## 10. Reliability, Security, and Error Handling

Treat reliability as a core feature.

Implement:
- Centralized error handling.
- Custom 404 and 500 pages.
- Error boundaries.
- Loading states and skeleton screens.
- Empty states.
- Form validation and useful error messages.
- Server-side validation.
- Secure authentication and authorization.
- Database error handling.
- File upload validation.
- File size and type restrictions.
- Rate limiting for sensitive public endpoints.
- Protection against common web vulnerabilities.
- Secure HTTP headers.
- Safe environment variable handling.
- Audit logging for important administrative actions.
- Appropriate logging and error monitoring.

Use custom SVG illustrations for empty states, errors, and selected visual elements where appropriate. Never let an SVG, animation, or external asset failure break the main website.

## 11. Scalability and Performance

Prepare the platform for thousands of visitors and increasing business activity.

- Use efficient database queries and pagination.
- Add indexes to frequently queried database columns.
- Use caching and revalidation appropriately.
- Optimize image and video delivery.
- Lazy-load noncritical content.
- Keep client-side JavaScript minimal.
- Use Server Components by default where suitable.
- Use background processing for tasks that should not block user requests.
- Avoid unnecessary database calls.
- Keep components reusable and maintainable.
- Implement responsive layouts for mobile, tablet, and desktop.

Do not introduce microservices or complicated infrastructure without a real need. Start with a well-structured Next.js application and a properly designed Supabase backend.

## 12. Application Architecture

Use the following architecture as the foundation:

```text
ELEVANTE/
│
├── PUBLIC WEBSITE
│   ├── Home
│   ├── About
│   ├── Services
│   ├── Service Details
│   ├── Portfolio
│   ├── Project Details
│   ├── Contact
│   ├── FAQ
│   └── Legal Pages
│
├── AUTHENTICATION
│   ├── Register
│   ├── Login
│   ├── Email Verification
│   ├── Forgot Password
│   └── Reset Password
│
├── CUSTOMER PORTAL
│   ├── Dashboard Overview
│   ├── Start a Project
│   ├── My Projects
│   ├── Project Details
│   ├── Quotations
│   ├── Messages
│   ├── Notifications
│   ├── My Files
│   └── Account Settings
│
├── ADMIN PANEL
│   ├── Dashboard Overview
│   ├── Customer Management
│   ├── Service Management
│   ├── Category Management
│   ├── Dynamic Form Builder
│   ├── Project Management
│   ├── Quotation Management
│   ├── Portfolio Management
│   ├── Website Content Management
│   ├── Media Management
│   ├── Team Management
│   ├── Analytics
│   ├── Notifications
│   ├── Audit Logs
│   └── Settings
│
├── BACKEND
│   ├── Authentication
│   ├── Authorization
│   ├── Database Operations
│   ├── Service Logic
│   ├── Project Workflow
│   ├── File Management
│   ├── Email Notifications
│   ├── Validation
│   └── Error Handling
│
└── DATABASE & STORAGE
    ├── Supabase PostgreSQL
    ├── Supabase Auth
    └── Supabase Storage
```

Suggested source-code organization:

```text
src/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── dashboard/
│   ├── admin/
│   └── api/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── marketing/
│   ├── services/
│   ├── dashboard/
│   └── admin/
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── validations/
│   └── utils/
├── hooks/
├── types/
├── config/
└── styles/

supabase/
├── migrations/
├── seed.sql
└── config.toml

public/
├── images/
├── videos/
├── icons/
├── logos/
└── fonts/
```

## 13. Development Instructions

Before implementation:

1. Understand the entire project and its business workflow.
2. Establish the architecture and database relationships.
3. Define the design system and reusable components.
4. Plan authentication, roles, permissions, and security.
5. Create a clear implementation roadmap.

Develop in well-defined phases. Test each major module before moving to the next. Keep the application functional throughout development.

Do not:
- Build only a frontend with fake data.
- Hardcode services that should be database-driven.
- Use mock authentication as a replacement for real authentication.
- Store customer records only in browser storage.
- expose admin operations through unprotected endpoints.
- Invent payment success or order completion.
- Ignore mobile responsiveness.
- Leave critical buttons nonfunctional.
- Hide errors without handling them.
- Sacrifice performance for unnecessary animations.

**Final objective:** Deliver a complete, secure, visually impressive, SEO/AEO/GEO-conscious, database-driven digital agency platform that Elevante can deploy and operate as a real business. Prioritize correctness, functionality, and maintainability over rushing to produce a visually attractive frontend.