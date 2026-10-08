# Technology Stack Research: DSA Platform with AWS Kubernetes & Admin Portal

## Recommended 2026/2027 Stack

### Core Web Framework & Frontend
- **Framework**: Next.js 15 (App Router with Server Actions & API Routes)
- **Styling**: Vanilla CSS / Tailwind-like design tokens with sleek dark mode, glassmorphism, CSS Modules, dynamic micro-animations
- **Code Editor**: `@monaco-editor/react` (VS Code engine in browser with multi-language syntax highlighting, autocomplete, theme customization)
- **State & UI**: Lucide Icons, Recharts (for admin telemetry & submission analytics)

### Backend Services & Database
- **Primary Database**: PostgreSQL with Prisma ORM (User profiles, RBAC roles, Problem definitions, Test cases, Submission history)
- **Submission Queue & Caching**: Redis + BullMQ (asynchronous job queue for fanning out code submissions to Kubernetes execution workers)
- **Authentication**: NextAuth.js / Auth.js (Email/Password, Google/GitHub OAuth, Role-Based Access Control - User, Admin, Auditor)

### Runtime & Infrastructure (AWS Kubernetes)
- **Container Orchestration**: AWS EKS (Elastic Kubernetes Service)
- **Execution Workers**: Isolated K8s Pods / Jobs (disposable containers executing user code per submission)
- **Container Isolation**: Docker container runtime with resource limits (CPU quotas, Memory bounds, no network egress for untrusted pods)
- **Deployment & Infra-as-Code**: Helm Charts + Kubernetes Deployment & Service Manifests (`helm/dsa-platform`)

## What NOT to Use & Why
- **In-process `eval()` or local `child_process.exec()`**: Highly dangerous; untrusted user code must NEVER run on the main web server process.
- **Monolithic synchronous submission API**: Will block web server threads during execution; asynchronous queueing (Redis/BullMQ) is mandatory.
