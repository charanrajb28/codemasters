# Domain Pitfalls & Security Mitigations: Online Judge in Kubernetes

## Critical Security Pitfalls

### 1. Arbitrary Code Execution & Cluster Compromise
- **Risk**: User-submitted code (e.g. `import os; os.system("curl malicious.com")` or reading K8s service account tokens at `/var/run/secrets/kubernetes.io/serviceaccount`) could compromise the EKS cluster or exfiltrate environment variables.
- **Prevention Strategy**:
  - Run execution pods under a restricted ServiceAccount with `automountServiceAccountToken: false`.
  - Apply K8s NetworkPolicies restricting egress traffic (no outbound internet access from runner pods).
  - Enforce `readOnlyRootFilesystem: true` and non-root UID execution (`runAsNonRoot: true`, `runAsUser: 1000`).

### 2. Resource Exhaustion & Denial of Service (DDoS)
- **Risk**: Submissions containing infinite loops (`while True: pass`), memory allocation bombs (`a = [0] * 10**9`), or fork bombs (`while True: os.fork()`) can crash worker nodes.
- **Prevention Strategy**:
  - Set hard `resources.limits.cpu` and `resources.limits.memory` on every runner pod manifest.
  - Implement strict process limit (`pidsLimit`) and hard execution timeout (e.g., 5 seconds max per test case).
  - Rate-limit submission APIs per user using Redis token bucket.

### 3. Synchronous Blocking & UI Unresponsiveness
- **Risk**: Waiting synchronously for Kubernetes pod creation, code execution, and cleanup inside the web API route causes request timeouts and degrades UI UX.
- **Prevention Strategy**:
  - Use asynchronous queueing (BullMQ + Redis).
  - Send status updates via polling or WebSocket/Server-Sent Events (SSE) so the user UI displays real-time execution steps ("Queued" -> "Spinning up container" -> "Running test 3/5" -> "Completed").

### 4. Admin Privileges Over-Exposure
- **Risk**: Weak RBAC checks letting non-admin users access admin APIs or view hidden test cases.
- **Prevention Strategy**:
  - Enforce server-side role validation in Next.js Server Actions / API middleware for all administrative routes (`/admin/*`).
  - Strip hidden test cases from client-side responses; evaluate hidden test cases strictly inside the execution worker.
