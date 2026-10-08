# Project Roadmap: DSA Code Execution & Admin Platform

## Overview

The roadmap is structured into 4 coarse phases designed to establish the core web foundation & UI design system, deliver the Admin Portal & Problem Management system, build the Student Code Editor Workspace & submission pipeline, and implement the Kubernetes Code Execution Engine for AWS EKS.

---

## Phase Structure

### Phase 1: Foundation, Database & Modern UI Design System
**Goal**: Establish Next.js 15 App Router, PostgreSQL database schema with Prisma ORM, Auth.js RBAC authentication, and a high-aesthetic dark-mode UI design system with micro-animations.
**Requirements**: AUTH-01, AUTH-02, UI-01, UI-02
**UI Hint**: yes

#### Success Criteria
1. User can register an account, log in with email/password, and session persists securely across page reloads.
2. User roles (Admin, Student) are enforced via server middleware restricting access to administrative paths.
3. Design system with dark theme tokens, navigation header, glassmorphic card primitives, and responsive layout is fully functional.

---

### Phase 2: Admin Portal & Problem Authoring Suite
**Goal**: Deliver a comprehensive Admin Portal for managing platform users, creating and editing DSA coding problems, defining test cases, and monitoring platform execution telemetry.
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04
**UI Hint**: yes

#### Success Criteria
1. Admin can view all registered users, filter by role, and suspend/activate accounts.
2. Admin can create, edit, list, and delete coding problems with title, difficulty, description, time limit, and memory limit.
3. Admin can add sample test cases (public) and evaluation test cases (hidden).
4. Admin telemetry dashboard displays submission volume, queue metrics, and system status charts.

---

### Phase 3: Student Workspace & Code Editor Workspace
**Goal**: Build the student problem catalog, interactive split-pane problem workspace with Monaco editor, sample test case execution interface, submission queueing with Redis/BullMQ, and submission history log.
**Requirements**: STUDENT-01, STUDENT-02, STUDENT-03, STUDENT-04, STUDENT-05, STUDENT-06
**UI Hint**: yes

#### Success Criteria
1. Student can browse, search, and filter problems by difficulty and tag.
2. Student can open problem workspace, write code in Monaco editor across Python, C++, Java, and JavaScript, and switch themes.
3. Student can run code against sample test cases and view stdout/stderr output in real-time.
4. Student can submit code, receive queued status update, and view submission history with execution time & memory diff.

---

### Phase 4: Kubernetes Execution Engine & AWS EKS Infrastructure
**Goal**: Implement the asynchronous K8s execution worker service, containerized code runners, AWS EKS pod resource & security constraints, Dockerfiles, and Helm deployment charts.
**Requirements**: EXEC-01, EXEC-02, EXEC-03, EXEC-04, INFRA-01, INFRA-02
**UI Hint**: no

#### Success Criteria
1. Redis/BullMQ worker receives submission jobs, creates transient runner pods in Kubernetes via K8s API, and collects execution stdout/stderr & metrics.
2. Runner pods enforce strict CPU, memory limits, non-root execution, and timeout limits (TLE/MLE).
3. Dockerfiles provided for Web App, Worker, and multi-language runner containers.
4. Helm chart (`helm/dsa-platform`) validated with Kubernetes manifests, service accounts, and network policies for AWS EKS.

---

## Requirements Mapping Table

| Requirement ID | Phase | Description |
|----------------|-------|-------------|
| AUTH-01 | Phase 1 | Account creation & login session management |
| AUTH-02 | Phase 1 | RBAC authorization (Student vs Admin) |
| UI-01 | Phase 1 | Modern dark-mode UI design system & CSS tokens |
| UI-02 | Phase 1 | Responsive layout & navigation framework |
| ADMIN-01 | Phase 2 | Admin User Management (list, filter, suspend, roles) |
| ADMIN-02 | Phase 2 | Admin Problem CRUD interface |
| ADMIN-03 | Phase 2 | Sample & hidden test case authoring |
| ADMIN-04 | Phase 2 | Admin system telemetry & metrics dashboard |
| STUDENT-01 | Phase 3 | Problem catalog search & filtering |
| STUDENT-02 | Phase 3 | Problem statement & constraints view |
| STUDENT-03 | Phase 3 | Interactive Monaco code editor workspace |
| STUDENT-04 | Phase 3 | Sample test case runner output panel |
| STUDENT-05 | Phase 3 | Real-time submission status pipeline |
| STUDENT-06 | Phase 3 | Submission history & code comparison |
| EXEC-01 | Phase 4 | Redis/BullMQ submission job queue |
| EXEC-02 | Phase 4 | K8s API runner worker service for AWS EKS |
| EXEC-03 | Phase 4 | Pod resource limits, timeouts & isolation |
| EXEC-04 | Phase 4 | Test evaluation & submission result recorder |
| INFRA-01 | Phase 4 | Dockerfiles for Web App, Worker, and Runtimes |
| INFRA-02 | Phase 4 | Helm charts & K8s deployment manifests for EKS |
