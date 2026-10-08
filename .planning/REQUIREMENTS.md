# Project Requirements: DSA Code Execution & Admin Platform

## v1 Requirements

### Authentication & Access Control (AUTH)
- [ ] **AUTH-01**: User can register an account, log in with email/password, and log out securely across sessions.
- [ ] **AUTH-02**: System enforces Role-Based Access Control (RBAC) separating Student, Instructor, and Admin privileges across server actions and API routes.

### Admin Portal & Management (ADMIN)
- [ ] **ADMIN-01**: Admin user can view, search, and manage platform users (view user profile, toggle active/suspended status, promote/demote roles).
- [ ] **ADMIN-02**: Admin user can create, edit, delete, and list DSA practice problems with title, difficulty, description, time limit, memory limit, and tags.
- [ ] **ADMIN-03**: Admin user can add, edit, and remove problem test cases (sample test cases visible to users vs hidden evaluation test cases).
- [ ] **ADMIN-04**: Admin user can view real-time system metrics and execution telemetry (total submissions, verdict distribution, runner queue latency).

### Student Workspace & Practice (STUDENT)
- [ ] **STUDENT-01**: Student user can browse, search, and filter DSA problems by difficulty, category, and completion status.
- [ ] **STUDENT-02**: Student user can access problem statement workspace with formatted markdown description, constraints, and sample inputs/outputs.
- [ ] **STUDENT-03**: Student user can write code in Monaco editor with language selection (Python, C++, Java, JavaScript), syntax highlighting, and code auto-formatting.
- [ ] **STUDENT-04**: Student user can run code against sample test cases and view real-time stdout/stderr output before submitting.
- [ ] **STUDENT-05**: Student user can submit solution and view real-time status updates (Queued, Running, Verdict: Accepted, Wrong Answer, TLE, MLE, Runtime Error).
- [ ] **STUDENT-06**: Student user can view personal submission history for a problem with verdict, execution time, memory footprint, and code diff.

### Kubernetes Code Execution Engine (EXEC)
- [ ] **EXEC-01**: System enqueues code submissions into asynchronous Redis/BullMQ job queue to prevent web request timeouts.
- [ ] **EXEC-02**: Worker service processes submission jobs by invoking Kubernetes API to spin up isolated transient execution pods in AWS EKS.
- [ ] **EXEC-03**: Execution worker enforces CPU/memory resource limits, execution timeouts (TLE), and non-root execution policies on runner pods.
- [ ] **EXEC-04**: Worker evaluates code output against test cases, captures execution metrics, and updates submission record in PostgreSQL.

### AWS Infrastructure & Helm Deployment (INFRA)
- [ ] **INFRA-01**: Dockerfiles provided for Next.js Web App, Execution Worker, and multi-language Code Runner runtime images (Python, C++, Java, Node.js).
- [ ] **INFRA-02**: Helm chart (`helm/dsa-platform`) provided with templates for AWS EKS deployment (Web App deployment, Redis deployment, K8s RBAC roles for runner pod management, and NetworkPolicies).

### UI/UX Design System (UI)
- [ ] **UI-01**: Platform features a modern, premium dark-mode aesthetic with custom CSS tokens, smooth hover micro-animations, glassmorphic card overlays, and high contrast typography.
- [ ] **UI-02**: Responsive layouts for both Admin Portal and Student Code Editor workspace optimizing screen real estate for split-pane code editing and telemetry dashboards.

## v2 Requirements (Deferred)
- **FEAT-V2-01**: Live coding contest module with real-time leaderboard web-sockets.
- **FEAT-V2-02**: AI-assisted code reviewer providing algorithmic complexity analysis (Big-O time/space complexity).
- **FEAT-V2-03**: Kata Containers / gVisor sandbox runtime option for high-security isolation.

## Out of Scope
- Real-time pair programming IDE (collaboration) — deferred to keep v1 focus on individual practice & admin controls.
- Custom bare-metal container sandbox — standard Docker + Kubernetes EKS pod isolation with NetworkPolicies is sufficient.

## Traceability

| Requirement ID | Phase | Plan | Status |
|----------------|-------|------|--------|
| AUTH-01 | Phase 1 | Pending | Pending |
| AUTH-02 | Phase 1 | Pending | Pending |
| UI-01 | Phase 1 | Pending | Pending |
| UI-02 | Phase 1 | Pending | Pending |
| ADMIN-01 | Phase 2 | Pending | Pending |
| ADMIN-02 | Phase 2 | Pending | Pending |
| ADMIN-03 | Phase 2 | Pending | Pending |
| ADMIN-04 | Phase 2 | Pending | Pending |
| STUDENT-01 | Phase 3 | Pending | Pending |
| STUDENT-02 | Phase 3 | Pending | Pending |
| STUDENT-03 | Phase 3 | Pending | Pending |
| STUDENT-04 | Phase 3 | Pending | Pending |
| STUDENT-05 | Phase 3 | Pending | Pending |
| STUDENT-06 | Phase 3 | Pending | Pending |
| EXEC-01 | Phase 4 | Pending | Pending |
| EXEC-02 | Phase 4 | Pending | Pending |
| EXEC-03 | Phase 4 | Pending | Pending |
| EXEC-04 | Phase 4 | Pending | Pending |
| INFRA-01 | Phase 4 | Pending | Pending |
| INFRA-02 | Phase 4 | Pending | Pending |

