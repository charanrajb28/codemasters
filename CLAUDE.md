<!-- GSD:project-start source:PROJECT.md -->
## Project

**DSA Code Execution & Admin Platform**

A modern Data Structures & Algorithms (DSA) practice and assessment platform equipped with secure code execution workers running in isolated Vercel Sandbox MicroVMs (`@vercel/sandbox`), alongside a feature-rich Admin Portal for user and access management, problem creation, and runtime telemetry.

**Core Value:** Secure, low-latency, isolated code execution in Vercel Sandbox MicroVMs with a seamless, high-performance web experience and administrative control center.

### Constraints

- **Runtime**: Vercel Sandbox (`@vercel/sandbox` Firecracker MicroVMs) with local sandbox fallback
- **Frontend/Backend**: Next.js App Router full-stack architecture
- **Design Standard**: Premium modern aesthetic, intuitive user flows, rich dark-mode design system
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Web Framework & Frontend
- **Framework**: Next.js 15 (App Router with Server Actions & API Routes)
- **Styling**: Vanilla CSS / Tailwind-like design tokens with sleek dark mode, glassmorphism, CSS Modules, dynamic micro-animations
- **Code Editor**: `@monaco-editor/react` (VS Code engine in browser with multi-language syntax highlighting, autocomplete, theme customization)
- **State & UI**: Lucide Icons, Recharts (for admin telemetry & submission analytics)
### Backend Services & Database
- **Primary Database**: Firebase Firestore (User profiles, RBAC roles, Problem definitions, Test cases, Submission history)
- **Authentication**: NextAuth.js / Auth.js & Firebase Auth
### Runtime & Infrastructure (Vercel Sandbox)
- **Execution Sandbox**: Vercel Sandbox (`@vercel/sandbox` isolated Firecracker MicroVMs)
- **Container Isolation**: Secure kernel-level isolation, resource bounds, disposable execution sessions
- **Deployment**: Single `git push` to Vercel — zero AWS EKS / Kubernetes infrastructure overhead
## What NOT to Use & Why
- **In-process `eval()` or unconstrained local exec in production**: Untrusted user code runs in isolated Vercel Sandbox microVMs.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
