# DSA Code Execution & Admin Platform

## What This Is

A modern Data Structures & Algorithms (DSA) practice and assessment platform equipped with secure code execution workers running in AWS Kubernetes (EKS), alongside a feature-rich Admin Portal for user and access management, problem creation, and runtime telemetry.

## Core Value

Secure, low-latency, containerized code execution in Kubernetes with a seamless, high-performance web experience and administrative control center.

## Requirements

### Validated

- ✓ **AUTH-01**: User account registration & login session management — *Phase 1*
- ✓ **AUTH-02**: Role-Based Access Control (RBAC) separating Student and Admin roles — *Phase 1*
- ✓ **UI-01**: Midnight Monochrome dark-mode UI design system & CSS tokens — *Phase 1*
- ✓ **UI-02**: Collapsible Left Sidebar + Top Action Bar layout navigation — *Phase 1*
- ✓ **ADMIN-01**: User & Access Management table (role dropdown, suspension toggle, search) — *Phase 2*
- ✓ **ADMIN-02**: Problem Authoring Suite (CRUD problems, time/memory limits, tags) — *Phase 2*
- ✓ **ADMIN-03**: Test Case Management (Split-pane Markdown editor, JSON/Batch import, hidden test case flags) — *Phase 2*
- ✓ **ADMIN-04**: Executive Telemetry Dashboard (KPI stat cards & Recharts analytics) — *Phase 2*
- ✓ **STUDENT-01**: Student Problem Catalog with search, tags, and status filtering — *Phase 3*
- ✓ **STUDENT-02**: Problem statement & constraints view with formatted Markdown — *Phase 3*
- ✓ **STUDENT-03**: Interactive Monaco code editor workspace with starter templates & draft saving — *Phase 3*
- ✓ **STUDENT-04**: Sample test case runner drawer with stdout/stderr diff view — *Phase 3*
- ✓ **STUDENT-05**: Real-time submission evaluation status pipeline & Verdict cards — *Phase 3*
- ✓ **STUDENT-06**: Submission history log & submitted code modal viewer — *Phase 3*

### Active

- [ ] Kubernetes-native code execution engine designed for AWS EKS deployment



### Out of Scope

- Real-time collaborative pair programming IDE — focus is individual practice and evaluation v1
- Custom bare-metal container sandbox — standard Kubernetes container isolation (gVisor/Kata optional) is preferred for AWS EKS

## Context

- Target runtime environment: AWS EKS (Elastic Kubernetes Service) with Docker containers and Helm deployment configurations.
- Web Application: Next.js (App Router) full-stack web application with high aesthetic UI/UX styling.
- Secure Execution: Code submissions run in isolated pods/jobs with strict CPU, memory, network, and timeout constraints.

## Constraints

- **Runtime**: AWS EKS with Docker containers & Helm chart definitions
- **Frontend/Backend**: Next.js App Router full-stack architecture
- **Design Standard**: Premium modern aesthetic, intuitive user flows, rich dark-mode design system

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router for Admin & Practice Portal | Unified full-stack JavaScript/TypeScript platform with server actions and SSR | — Pending |
| Kubernetes pod jobs on AWS EKS for Execution Engine | Provides strong container isolation, scaling, and cloud-native management | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-18 after project initialization*
