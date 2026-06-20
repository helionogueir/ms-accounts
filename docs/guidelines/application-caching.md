---
description: Caching strategy and guidelines for the Macro Service.
globs: ["src/**/*.ts"]
---

# Application Caching Strategy

## Overview

The Macro Service handles high-throughput read operations (e.g., token validation, role lookups, feature flags). To protect the PostgreSQL database from excessive load and guarantee low latency, we employ a distributed caching strategy using **Redis**.

While the Redis client implementation lives in the `infrastructure` layer, the caching rules, TTLs, and invalidation logic are orchestrated by the `application` layer via a `CacheService` Port.

## Caching Rules & Patterns

- **Cache-Aside Pattern:** This is our default strategy. The application first queries the cache. If a cache miss occurs, it queries the database, saves the result in the cache, and then returns the data.
- **Key Naming Convention:** Cache keys must be highly predictable, namespaced, and standardized to prevent collisions.
  - *Format:* `namespace:entity:id:attribute`
  - *Examples:* `auth:user:123:roles`, `auth:session:abc-xyz`
- **Time-To-Live (TTL):** **Rule:** No data is cached infinitely. Every cache entry must have a deliberate TTL based on data volatility.
  - *Short TTL (Minutes):* Highly volatile data or rate-limiting counters.
  - *Medium TTL (Hours):* User sessions or OAuth tokens.
  - *Long TTL (Days):* Static RBAC policies or system configurations.
- **Cache Invalidation:** The hardest problem in computer science. We handle it explicitly:
  - When an entity is updated or deleted in the database, the corresponding Use Case **must** proactively delete the associated cache keys (e.g., `UpdateUserRoleUseCase` must invalidate `auth:user:{id}:roles`).
- **Thundering Herd (Cache Stampede) Protection:** For highly accessed endpoints (like JWKS keys or public config), a cache expiration can cause a massive spike in DB queries.
  - *Fix:* Use locking mechanisms or add slight randomization (jitter) to the TTL of hot keys so they don't all expire at the exact same millisecond.
- **Fail-Open Strategy:** The cache is a secondary data store. If the Redis cluster becomes unavailable, the application must log a critical alert but **fail-open** by gracefully degrading to querying the PostgreSQL database directly, ensuring the system remains operational.

## Clean Architecture Integration

- The `domain` layer knows nothing about caching.
- The `application` layer defines an interface: `interface ICacheService { get(key), set(key, val, ttl), del(key) }`. Use Cases inject this interface to manage cache state.
- The `infrastructure` layer implements `RedisCacheService` which adheres to the `ICacheService` interface.
