---
description: Security guidelines and OWASP Top 10 mapping for the Accounts Macro Service.
globs: ["src/**/*.ts"]
---

# Application Security

## Overview

Security guidelines for the Macro Service API. As a central identity provider, this service adheres to strict security standards, prioritizing data protection, secure authentication, and robust access control.

## Application Security (OWASP Top 10 for Node.js/TS)

- **Injection (SQL/NoSQL/OS):** Prevented by strictly using parameterized queries or a safe ORM/Query Builder. **Rule:** Never use TypeScript template literals (e.g., `` `SELECT * FROM users WHERE id = ${id}` ``) or string concatenation for database queries.
- **Broken Authentication:** Protect against brute-force and credential stuffing. **Rule:** Enforce strong password hashing (Argon2 or bcrypt with high cost factors). Implement strict rate-limiting on all `/signin`, `/signup`, and `/recovery` endpoints. Tokens (JWT/Sessions) must have short expirations and secure rotation mechanisms.
- **Sensitive Data Exposure:** Protect PII (Personally Identifiable Information) and credentials. **Rule:** Never commit secrets to code. Never log plaintext passwords, tokens, or PII. All cookies must use `Secure`, `HttpOnly`, and `SameSite=Strict` flags. Enforce HTTPS (`TLS 1.3`) strictly.
- **XXE / SSRF:** Prevent server-side request forgery. **Rule:** If the application fetches remote resources (e.g., downloading an avatar from a Social Login provider), strictly validate and allowlist the URLs. Disable external entity resolution in any XML parsers.
- **Broken Access Control (IDOR):** Ensure users can only access their own data. **Rule:** Use custom authorization middleware (e.g., `requireAuth`, `requireRole`) on protected routes. Always validate ownership (e.g., "Does `session.userId` match the requested `resource.userId`?").
- **Security Misconfiguration:** Prevent information leakage. **Rule:** Ensure `NODE_ENV=production` is set to prevent verbose stack traces from reaching clients. Configure strict CORS policies (never use `Access-Control-Allow-Origin: *` in production). Secure HTTP headers using tools like `helmet`.
- **XSS (Cross-Site Scripting):** Although primarily a frontend concern, the backend must sanitize user input and send appropriate CSP (Content Security Policy) headers.
- **Insecure Deserialization & Prototype Pollution:** Specific to the JavaScript ecosystem. **Rule:** Never pass untrusted input into `eval()`, `setTimeout()`, or insecure YAML parsers. Avoid deep merging of untrusted objects without prototype pollution protection (e.g., do not mutate `Object.prototype`).
- **Vulnerable Dependencies:** **Rule:** Use `pnpm audit` in the CI/CD pipeline to block deployments with known Critical or High CVEs in third-party packages.
- **Insufficient Logging & Monitoring:** **Rule:** Maintain a secure, tamper-evident audit trail for all critical events: successful/failed logins, password resets, role changes, and MFA updates.

## Data Retention & Deletion

- **Soft Delete Pattern:** By default, use soft deletes (e.g., `deletedAt` timestamp or `isActive: false` flag) for user-facing or auditable data to maintain relational integrity and audit history.
- **Hard Delete Exceptions:** Hard `DELETE` operations are strictly forbidden unless specifically required by data privacy regulations (e.g., GDPR Right to Erasure / LGPD), legal data-retention mandates, or explicit purge-after-TTL policies.

## DevSecOps & CI/CD Integration

Security must be validated automatically before reaching production:
- **SAST (Static Application Security Testing):** Code must pass static analysis (e.g., SonarQube, ESLint security plugins) in the PR phase.
- **Secret Scanning:** Pipelines must actively block commits containing hardcoded API keys or database URIs.
