---
description: Correctness and bug-prevention guidelines for the Macro Service.
globs: ["src/**/*.ts"]
---

# Application Correctness

## Overview

Correctness guidelines ensure that the Macro Service behaves exactly as expected under all conditions. In a Node.js/TypeScript environment, correctness means strictly managing asynchronous state, handling data type boundaries, and avoiding silent failures.

## 1. Logic & Boundaries

- **Off-by-One Errors:** Double-check loop bounds, array slicing (`.slice()`, `.splice()`), and pagination offsets.
- **Edge Cases & Falsy Values:** JavaScript has complex truthiness rules. Be explicit when checking for empty states.
  - *Fix:* Avoid generic `if (!value)` checks if `0` or `""` (empty string) are valid business values. Explicitly check for `null` or `undefined` (e.g., `if (value == null)` or using Nullish Coalescing `??`).

## 2. State & Asynchronous Concurrency

- **Async Race Conditions:** Since Node.js is heavily asynchronous, watch out for interleaving operations.
  - *Danger:* Fetching a record, `await`-ing a long task, and then updating the record. Another request might modify the record during the `await`.
  - *Fix:* Use database-level locks (e.g., `SELECT ... FOR UPDATE` in PostgreSQL) or atomic update queries (`UPDATE users SET balance = balance - 10 WHERE balance >= 10`) instead of calculating values in application memory.
- **Shared Mutable State:** Avoid modifying global variables or module-level variables across different incoming HTTP requests.

## 3. Data Types & Precision

- **Large Integers:** JavaScript numbers lose precision beyond `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991).
  - *Fix:* When handling large database IDs (like Snowflakes) or exact financial/cryptographic math, always use `BigInt` or map the database types to `string`.

## 4. Timezone & Dates

- **Timezone Leaks:** Never assume the server's local timezone. Mixing naive datetimes with timezone-aware datetimes leads to silent data corruption.
  - *Fix:* Always store dates in **UTC** in PostgreSQL (`TIMESTAMP WITH TIME ZONE`). Use ISO 8601 strings (`YYYY-MM-DDTHH:mm:ss.sssZ`) for API boundaries.

## 5. Error Handling & State Recovery

- **Swallowed Exceptions:** Catching an error and doing nothing makes debugging impossible.
  - *Fix:* Never use empty catch blocks (`catch (err) {}`). At minimum, log the error and its stack trace.
- **Missing Rollbacks:** Partial failures in complex workflows (e.g., saving a user but failing to save their roles).
  - *Fix:* Use **Database Transactions** for multi-step write operations. Ensure `ROLLBACK` is explicitly called in the `catch` block if the transaction fails.

## 6. Contract & Spelling

- **API Contract Adherence:** Ensure the code strictly matches the defined API schemas (e.g., missing required fields, returning a string when a boolean is expected). Rely on TypeScript interfaces and runtime validation (like Zod) to catch this.
- **Orthographic & Typo Errors:** Always check the spelling of code identifiers, database column names, and string literals. A typo in an environment variable name (e.g., `DB_PASWORD`) can silently break the application.
