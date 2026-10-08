# Research Summary: DSA Code Execution & Admin Platform

## Executive Summary

Building a modern Data Structures & Algorithms practice platform with an Admin Portal and Kubernetes runtime requires decoupling the full-stack web tier from the isolated execution engine.

## Recommended Technology Stack
- **Web App**: Next.js 15 (App Router, Server Actions, TypeScript)
- **UI/UX Design**: Modern dark mode design system, custom CSS Modules/Tokens, Monaco Code Editor, Lucide Icons, Recharts telemetry
- **Database & Queue**: PostgreSQL (Prisma ORM) + Redis & BullMQ
- **Runtime**: AWS EKS (Elastic Kubernetes Service), isolated Docker execution containers, K8s Jobs/Pods API, Helm chart deployment package

## Key Architectural Decisions
1. **Asynchronous Execution Pipeline**: Next.js enqueues submissions into Redis -> Worker claims job and spawns isolated K8s Pod -> Pod evaluates user code against test cases -> Results saved to PostgreSQL -> Real-time status streamed to user UI.
2. **Comprehensive Admin Portal**: RBAC user administration, problem authoring suite with test case manager, and live K8s worker telemetry.
3. **Hardened Container Security**: Runner pods restricted by K8s NetworkPolicies (no egress), disabled service account tokens, read-only root filesystems, CPU/memory limits, and hard execution timeouts.

## Next Steps
Proceed to defining v1 Requirements (`REQUIREMENTS.md`) and creating the multi-phase Roadmap (`ROADMAP.md`).
