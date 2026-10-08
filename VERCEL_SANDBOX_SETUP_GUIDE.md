# ⚡ Vercel Sandbox Setup Guide

This guide explains how code execution works on the **DSA Code Execution Platform** using **Vercel Sandbox** (`@vercel/sandbox`).

---

## 🎯 Architecture Overview

Previously, the platform used a standalone AWS Kubernetes (EKS) cluster with Docker runner pods, Application Load Balancers, and API Gateway.

### New Architecture:
- **Zero Cloud Server Overhead**: No EC2 worker nodes, no EKS control plane fees (~$73/mo), no NAT Gateways (~$35/mo).
- **Native MicroVMs**: Code is executed inside disposable, kernel-isolated Linux Firecracker MicroVMs provisioned dynamically via `@vercel/sandbox`.
- **Integrated Full-Stack**: Code execution runs directly from Next.js Server Actions ([src/actions/student-actions.ts](file:///c:/local%20disk%20d/codemasters_vercel/src/actions/student-actions.ts)) and the unified sandbox runner ([src/lib/sandbox-runner.ts](file:///c:/local%20disk%20d/codemasters_vercel/src/lib/sandbox-runner.ts)).
- **Development Fallback**: In local development without Vercel credentials, an isolated local sandbox automatically executes code so `npm run dev` works out of the box.

---

## 🚀 How It Works

1. **User clicks "Run"**:
   - `runSampleTestCasesAction` sends code + visible test case inputs to `evaluateCodeSnippet` in `src/lib/sandbox-runner.ts`.
   - The sandbox spins up a microVM, writes `solution.<ext>` and `input.txt`, runs the solution with strict timeouts, and returns standard output and execution time in milliseconds.
2. **User clicks "Submit"**:
   - `submitSolutionAction` creates a Firestore record with status `QUEUED`.
   - `processSubmissionJob` evaluates all test cases asynchronously, streams progress, and writes final verdict (`ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`, etc.) to Firestore.
   - Frontend live status polling receives the updated submission state immediately.

---

## ⚙️ Environment Variables

### In Production on Vercel:
When deploying to Vercel, Vercel Sandboxes authenticate automatically via **Vercel OIDC**:
- Enable **Vercel Sandbox** in your Vercel Project Settings.
- Link your project with:
  ```bash
  npx vercel link
  ```
- Pull your development environment variables:
  ```bash
  npx vercel env pull .env.local
  ```

### Optional manual credentials:
If running in external CI/CD or non-Vercel environments with `@vercel/sandbox`:
- `VERCEL_TOKEN`: Vercel Personal Access Token or Service Account Token
- `VERCEL_PROJECT_ID`: Your Vercel Project ID
- `VERCEL_TEAM_ID`: Your Vercel Team ID (if applicable)

---

## 💻 Supported Languages & Runtimes

| Language | File | Command in Sandbox |
| :--- | :--- | :--- |
| **Python** | `solution.py` | `python3 solution.py < input.txt` |
| **JavaScript** | `solution.js` | `node solution.js < input.txt` |
| **C++** | `solution.cpp` | `g++ -O3 solution.cpp -o solution && ./solution < input.txt` |
| **Java** | `Solution.java` | `javac Solution.java && java Solution < input.txt` |

---

## 🧹 AWS Decommissioning Checklist

If you previously set up AWS resources for this project, you can now safely delete them on AWS to stop cloud bills:
- [x] Terminate AWS EKS cluster (`eksctl delete cluster --name dsa_platform_cluster`)
- [x] Delete VPC NAT Gateways and release Elastic IPs
- [x] Delete Application Load Balancers / API Gateway
- [x] Delete ECR repositories (`761595200733.dkr.ecr.eu-north-1.amazonaws.com`)
- [x] Delete ElastiCache Redis cluster
