---
description: API design guidelines, RESTful patterns, and response contracts for the Macro Service.
globs: ["src/presentation/**/*.ts"]
---

# Application API Design

## Overview

The Macro Service exposes a RESTful API. To ensure a predictable and developer-friendly integration experience, all endpoints must adhere strictly to these design guidelines, standardized response formats, and proper HTTP semantics.

## RESTful URL Patterns

- **Nouns, Not Verbs:** Use nouns to represent resources. The HTTP method (GET, POST, PUT, DELETE) already defines the action.
  - *Good:* `POST /users` (Creates a user)
  - *Bad:* `POST /createUser`
- **Pluralization:** Always use plural nouns for collections to maintain consistency.
  - *Good:* `/users/123/roles`
  - *Bad:* `/user/123/role`
- **Resource Hierarchy:** Nest resources logically to show relationships, but avoid nesting deeper than two levels to prevent overly complex URLs.
  - *Good:* `GET /users/123/sessions`
  - *Bad:* `GET /users/123/sessions/456/tokens` (Consider flattening to `GET /sessions/456/tokens`)

## API Versioning

- **URI Versioning:** Versioning must be explicitly defined in the URL path, not in the headers. This makes caching and routing simpler and highly visible.
  - *Format:* `/api/v{major}/resource`
  - *Example:* `/api/v1/users`
- **Major Versions Only:** We only version major, breaking changes in the API (e.g., `v1`, `v2`). Non-breaking additions (like a new field in the response) do not require a version bump.

## HTTP Status Codes

Return the most accurate HTTP status code for every request. **Never** return a 200 OK with an error payload inside.

**Success Codes:**
- `200 OK`: Standard success (GET, PUT, PATCH).
- `201 Created`: A new resource was successfully created (POST).
- `204 No Content`: The request was successful, but there is no body to return (e.g., successful DELETE or SignOut).

**Client Error Codes:**
- `400 Bad Request`: Validation failure or malformed payload.
- `401 Unauthorized`: Missing, invalid, or expired authentication token.
- `403 Forbidden`: The user is authenticated but lacks the required roles/permissions (RBAC failure).
- `404 Not Found`: The requested resource or endpoint does not exist.
- `429 Too Many Requests`: Rate limit exceeded (Brute-force protection).

**Server Error Codes:**
- `500 Internal Server Error`: Unhandled application exception. (Should rarely happen; indicates a bug).
- `503 Service Unavailable`: Dependent service (like Redis or DB) is down.

## Standardized Response Payloads

All responses (except 204 No Content) must follow a strict JSON schema. This ensures frontend clients can write a single, unified interceptor to handle all API communications.

### Success Response Envelope

Always wrap the response data in a `data` object. If returning a list, include a `meta` object for pagination.

```json
// GET /api/v1/users/123
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "roles": ["admin"]
  }
}
```

```json
// GET /api/v1/users?page=1&limit=10
{
  "data": [
    { "id": "123", "email": "user@example.com" },
    { "id": "124", "email": "test@example.com" }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "hasNext": true
  }
}
```

### Error Response Envelope

Errors must never leak stack traces in production. They must provide a machine-readable `code` and a human-readable `message`. Validation errors should include a details array.

```json
// 400 Bad Request
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request payload is invalid.",
    "details": [
      {
        "field": "password",
        "message": "Password must be at least 8 characters long."
      }
    ]
  }
}
```

```json
// 401 Unauthorized
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "The provided access token has expired."
  }
}
```

## Security & Headers

- All API responses must be served over `HTTPS`.
- Ensure standard security headers are attached (e.g., via `helmet` in Node.js):
  - `Content-Type: application/json`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security` (HSTS)
