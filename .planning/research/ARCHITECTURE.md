# System Architecture: DSA Platform with AWS Kubernetes

## High-Level Architecture Diagram

```
[ Browser / User & Admin ]
            │ (HTTPS / REST & Server Actions)
            ▼
┌─────────────────────────────────────────────────────────┐
│ Next.js App Router (Full-Stack Web App)                  │
│  ├── Student Workspace & Monaco Code Editor             │
│  ├── Admin Portal (RBAC, User Mgt, Problem CRUD)         │
│  └── API Routes & Server Actions                        │
└───────────┬─────────────────────────────────┬───────────┘
            │ (DB Queries)                    │ (Enqueue Submission)
            ▼                                 ▼
┌────────────────────────┐      ┌─────────────────────────┐
│ PostgreSQL Database    │      │ Redis + BullMQ Queue    │
│ (Users, Problems,      │      └────────────┬────────────┘
│  Submissions, Roles)   │                   │ (Dequeue Job)
└────────────────────────┘                   ▼
                                ┌─────────────────────────┐
                                │ K8s Runner Controller   │
                                └────────────┬────────────┘
                                             │ (K8s API: Create Pod/Job)
                                             ▼
                                ┌─────────────────────────┐
                                │ AWS EKS Cluster         │
                                │  ├── Transient Pod (Py) │
                                │  ├── Transient Pod (C++)│
                                │  └── Resource Quotas    │
                                └─────────────────────────┘
```

## Component Boundaries

1. **Next.js Web Application**: Serves the UI for both students and admins. Handles authentication, RBAC checks, problem browsing, and submission triggering.
2. **PostgreSQL Data Layer**: Stores relational data including user credentials, user status, problem details, test cases, and historical submission logs.
3. **Queueing Layer (Redis + BullMQ)**: Decouples submission requests from execution. Prevents web server timeouts and handles spikes in traffic.
4. **K8s Execution Service**: Listens for submission jobs, formats test scripts, creates short-lived Pods in AWS EKS via Kubernetes API, enforces timeout and memory bounds, reads logs/stdout, and updates submission status in DB.
5. **AWS EKS Infrastructure**: Hosts cluster services, worker node pools, network policies (disabling internet access inside runner pods), and storage volumes.

## Recommended Build Order
1. **Phase 1: Foundation & Design System**: Core Next.js App, Database Schema & Prisma ORM, Admin & User RBAC Authentication, Theme & UI System.
2. **Phase 2: Admin Portal & Problem Management**: Admin dashboard, user management (suspend/roles), problem creation & test case manager.
3. **Phase 3: Student Workspace & Code Editor**: Problem view, Monaco editor integration, submission queueing (Redis/BullMQ).
4. **Phase 4: Kubernetes Code Execution Engine & AWS Deployment**: K8s runner worker service, Docker execution containers, Helm charts & AWS EKS deployment setup.
