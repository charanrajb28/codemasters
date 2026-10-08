---
phase: 4
name: Kubernetes Execution Engine & AWS EKS Infrastructure
created_at: "2026-09-23T12:24:00.000Z"
status: Context Locked
---

# Phase 4 Context & Architectural Decisions

## 🔒 Locked Architectural Choices

### 1. Dual Execution Mode (Local Sandbox + AWS EKS Dispatcher)
- **Dev Mode**: Uses local isolated node sub-processes for offline execution and fast feedback loop.
- **Production Mode**: Uses `@kubernetes/client-node` API to create transient `batch/v1` Jobs inside the `dsa-runner` namespace on AWS EKS (`dsa-eks-cluster`).

### 2. Redis & BullMQ Job Queue Architecture
- Connection string `REDIS_URL` connects seamlessly to local Redis (`redis://localhost:6379`) during dev, or AWS ElastiCache for Redis (`redis://dsa-redis-cluster...`) in production EKS deployments.
- Asynchronous worker (`src/worker/execution-worker.ts`) polls submission jobs from `submission-queue`.

### 3. Pod Resource & Security Context
- **CPU Cap**: `500m` max (limits CPU consumption).
- **Memory Cap**: `256Mi` max (enforces TLE / MLE bounds).
- **Execution Timeout**: 2000ms hard kill.
- **Security Policy**:
  - `runAsNonRoot: true`
  - `runAsUser: 1000`
  - `readOnlyRootFilesystem: true`
  - `allowPrivilegeEscalation: false`
  - Drop all capabilities (`capabilities.drop: ["ALL"]`).

### 4. Single-File AWS Infrastructure Master Guide
- All AWS CLI scripts, ECR repository configs, `eksctl` commands, IRSA IAM policies, K8s RBAC manifests, Dockerfiles, and Helm `values.yaml` settings are maintained in a single authoritative guide: [AWS_SETUP_GUIDE.md](file:///c:/local%20disk%20d/codemasters/AWS_SETUP_GUIDE.md).

---

## 📌 Requirements Coverage

- **EXEC-01**: Redis / BullMQ submission job queueing system.
- **EXEC-02**: Asynchronous K8s execution worker service for AWS EKS.
- **EXEC-03**: Container pod resource limits, execution timeouts, and isolation constraints.
- **EXEC-04**: Testcase verdict evaluation and Firestore submission recorder.
- **INFRA-01**: Multi-language Dockerfiles for Python, C++, Java, & Node.js runners + Web & Worker Dockerfiles.
- **INFRA-02**: Helm chart (`helm/dsa-platform`) & EKS Kubernetes deployment manifests.
