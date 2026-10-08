# Feature Breakdown: DSA Code Execution & Admin Platform

## Feature Categories

### 1. Admin Portal (v1 Table Stakes)
- **User & Access Management (RBAC)**: View list of users, assign roles (Admin, Student, Instructor), suspend/ban malicious accounts.
- **Problem Management**: Admin CRUD interface to create coding challenges, set time/memory limits, add hidden & sample test cases.
- **System Telemetry & Monitoring**: Overview dashboard displaying active Kubernetes runner pods, submission queue health, system errors, and daily execution stats.
- **Audit Logs**: Track administrative actions (user status changes, problem edits, system updates).

### 2. Practice & Execution Workspace (v1 Table Stakes)
- **Problem Catalog & Filtering**: Browse DSA problems by difficulty (Easy, Medium, Hard), tags (Arrays, Graphs, Dynamic Programming), and completion status.
- **Interactive Code Editor**: Monaco editor with language switcher (Python, C++, Java, JavaScript), code formatting, and theme toggling.
- **Test Case Runner**: Run sample test cases directly with immediate stdout/stderr output before submitting.
- **Full Submission Pipeline**: Submit solution to Kubernetes execution engine; view Verdict (Accepted, Wrong Answer, Time Limit Exceeded, Memory Limit Exceeded, Runtime Error).
- **Submission History**: Past submission logs with execution time, memory used, and code diff.

### 3. Kubernetes Runtime & AWS Infrastructure (v1 Table Stakes)
- **Isolated Pod Execution Engine**: Dedicated runner worker that pulls jobs from Redis and schedules transient K8s pods on AWS EKS.
- **Helm Package & K8s Manifests**: Ready-to-deploy Helm charts for Web App, Redis, PostgreSQL, and Execution Controller.

### 4. Differentiators (v2 / Future Scope)
- **Live Leaderboard & Contests**: Real-time contest module with timed coding rounds.
- **AI Code Assistant**: AI-powered hint generator and performance analyzer for submitted code.
- **Custom Sandbox Runtimes**: Support for Rust, Go, Haskell, and Kata Containers / gVisor sandboxing.
