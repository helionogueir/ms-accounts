---
description: Performance guidelines and best practices for the Macro Service.
globs: ["src/**/*.ts"]
---

# Application Performance

## Overview

Performance guidelines for the Macro Service. Since Node.js is single-threaded, our primary performance goals are: never blocking the Event Loop, optimizing PostgreSQL interactions, and minimizing Garbage Collection (GC) pressure.

## Performance Rules & Anti-Patterns

- **N+1 Queries:** DB calls inside a loop over a result set.
  - *Fix:* Use SQL `JOIN`s, ORM eager loading (e.g., `include` in Prisma, `with` in Drizzle), or implement the **DataLoader** pattern to batch and cache database requests.
- **Blocking the Event Loop (Synchronous I/O):** Node.js stops processing all requests if the main thread is blocked.
  - *Fix:* Never use synchronous methods like `fs.readFileSync`, `crypto.pbkdf2Sync`, or complex synchronous JSON parsing on large payloads in route handlers. Always use their asynchronous equivalents (`fs.promises`, async crypto methods). For heavy CPU-bound tasks, use `Worker Threads`.
- **Memory Leaks:** - *Fix:* Watch out for unclosed database connections or streams. Do not use unbounded in-memory objects (`{}`) for caching; always use an LRU (Least Recently Used) cache or an external service like Redis. Ensure `EventEmitter` listeners are properly removed (`removeListener`), otherwise they will accumulate.
- **Missing Indexes:** `WHERE`, `ORDER BY`, or `JOIN` operations on columns that are not indexed.
  - *Fix:* Ensure foreign keys and frequently queried fields (like `email`, `username`, `createdAt`) have B-Tree or Hash indexes in PostgreSQL. Use `EXPLAIN ANALYZE` to debug slow queries.
- **Missing Pagination:** List endpoints that return unbounded result sets (e.g., `SELECT * FROM users`).
  - *Fix:* Always enforce pagination. Prefer **Cursor-based pagination** (using indexed columns like `id` or `created_at`) over Limit/Offset for large datasets, as Offset performance degrades significantly at scale.
- **Algorithmic Complexity:** O(n²) or worse where a better algorithm exists.
  - *Fix:* Avoid nested loops over large arrays. For example, do not use `Array.prototype.find()` or `includes()` inside a `for` loop. Instead, map the data to a `Set` or `Map` first for O(1) lookups.
- **Excessive Allocation in Hot Paths (GC Pressure):** - *Fix:* Avoid large object construction or deep cloning inside tight loops. Instantiate regular expressions (`new RegExp(...)` or `/.../`) at the module level outside of loops, not inside the function execution path, to prevent repeated compilation.
