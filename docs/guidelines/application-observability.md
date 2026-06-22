---
description: Observability, logging, and monitoring guidelines for the Accounts Macro Service.
globs: ["src/**/*.ts"]
---

# Application Observability

## Overview

Observability is a first-class citizen in the Accounts Macro Service. To ensure high availability and rapid incident response, the system relies on the three pillars of observability: **Logs**, **Traces**, and **Metrics**.

In Node.js, standard output (`console.log`) is insufficient and strictly prohibited in production. We use high-performance, structured logging and distributed tracing.

## 1. Structured Logging

All logs must be output in **JSON format** in production. This allows log aggregators (e.g., Datadog, ELK, AWS CloudWatch) to index, query, and alert on specific fields.

- **Logger Library:** Use a high-performance JSON logger like `pino` or `winston` (configured for JSON).
- **Standardized Payload:** Every log entry must include at least:
  - `timestamp`: ISO 8601 UTC format.
  - `level`: `info`, `warn`, `error`, or `debug`.
  - `service`: `accounts-macro-service`.
  - `traceId`: The unique identifier for the current request context.
  - `message`: A human-readable summary of the event.
- **Log Levels:**
  - `ERROR`: System failures, unhandled exceptions, database connection drops. Requires immediate attention.
  - `WARN`: Recoverable errors, rate-limiting triggers, or deprecated API usage.
  - `INFO`: Business events (e.g., "User signed in", "Password reset requested"), application startup.
  - `DEBUG`: Verbose details strictly for development or troubleshooting. Must be disabled in production.

## 2. Distributed Tracing & Context

To follow a request through the system (and across potential external services), we must maintain context.

- **Correlation ID (Trace ID):** Every incoming HTTP request must be assigned a unique `X-Correlation-ID` (UUID v4) at the presentation/middleware layer.
- **Context Propagation:** This `traceId` must be passed down from the Controller to the Use Case, and finally to the Infrastructure layer (DB queries, Redis calls).
  - *Implementation:* Use Node.js `AsyncLocalStorage` (from the `node:async_hooks` module) to implicitly pass the trace context without polluting every function signature with a `traceId` parameter.

## 3. Data Masking & Security (PII)

Logs are a common vector for data breaches.

- **Rule:** **Never** log sensitive data. This includes:
  - Plaintext passwords or hashes.
  - JWTs, OAuth tokens, or Session IDs.
  - Personally Identifiable Information (PII) like raw emails, phone numbers, or credit card details.
- **Fix:** Configure the logger to automatically redact or mask sensitive fields (e.g., replacing `password` with `[REDACTED]`). Log user IDs instead of emails whenever possible.

## 4. Metrics

We track application health using the **RED** method for APIs:
- **R**ate: The number of requests per second (RPS).
- **E**rrors: The number of failed requests (HTTP 4xx and 5xx).
- **D**uration: Response times / Latency (P50, P90, P99 percentiles).

*Note:* Application metrics should be exposed via a dedicated, internal-only endpoint (e.g., `/metrics` using Prometheus format) and must not be accessible to the public internet.
