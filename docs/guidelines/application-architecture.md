---
description: Architectural guidelines and structure for the Macro Service API.
globs: ["src/**/*.ts"]
---

# Application Architecture

## Overview

Architectural guidelines and structure for the Macro Service API.

## Tech Stack

- **Runtime:** Node.js (>= 24)
- **Language:** TypeScript
- **Module System:** ESModules (ESM)
- **Package Manager:** pnpm
- **Database:** PostgreSQL
- **Cache:** Redis

## Design Principles & Patterns

The codebase adheres strictly to the following software engineering paradigms to ensure maintainability, testability, and scalability:

- **Clean Architecture:** Dependency rule flows inward. Outer layers (frameworks, databases) depend on inner layers (business logic, domain entities), never the other way around. This ensures the core application is framework-agnostic.
- **SOLID Principles:** - *Single Responsibility:* Every class/function has one reason to change (e.g., dedicated Use Cases for specific actions).
  - *Open/Closed:* Systems are open for extension but closed for modification (e.g., adding a new Social Login provider without rewriting core auth logic).
  - *Liskov Substitution:* Interfaces are strictly adhered to.
  - *Interface Segregation:* Small, focused interfaces (Ports) rather than massive generic ones.
  - *Dependency Inversion:* High-level modules depend on abstractions (Ports), not concrete implementations (Adapters).
- **Clean Code:** Emphasizes readability over cleverness. We use meaningful variable names, keep functions small and focused, handle errors gracefully, and write code that acts as its own documentation.
- **Immutability Pattern:** Variables and data structures should be immutable by default. Favor `const` over `let`, and avoid mutating objects directly. This prevents unintended side effects and ensures a predictable data flow.
- **Early Return Pattern (Guard Clauses):** Functions should validate constraints and fail fast. By handling errors and edge cases at the very top of a function and returning immediately, we avoid deep nesting (the "arrow anti-pattern") and keep the "happy path" clean and highly readable.

## Application Structure

### Directory Layout

```text
src/
├── domain/              # Enterprise Business Rules (Entities, Value Objects)
├── application/         # Application Business Rules (Use Cases, Ports)
├── presentation/        # Interface Adapters (Controllers, Routes)
├── infrastructure/      # Frameworks, Drivers, & Configs (DB Repositories, External APIs, Env setup)
├── main.ts              # Application entry point
└── app.environment.json # Represents the application environment variables
```

## Layer Responsibilities

- `src/domain`: The core of the system. Contains Entities, Value Objects, and domain errors. **Rule**: Must be pure TypeScript with zero external dependencies (no database or HTTP libraries).
- `src/application`: Contains the Use Cases (e.g., `RegisterUserUseCase`, `VerifyMfaUseCase`). It defines the interfaces (Ports) that the infrastructure layer must implement.
- `src/presentation`: Handles input/output. Receives HTTP requests, validates payloads, passes data to the Application layer, and formats HTTP responses.
- `src/infrastructure`: Implements the interfaces defined in the Application layer. This is where PostgreSQL queries, Redis caching, email provider integrations, and OAuth2.0 API calls live.
- `src/configs`: Handles environment validation, database connection setup, logger instantiation, and wire-up of dependencies.

## Environment configuration

- `app.environment.json`: Stores application environment variables. These must be strongly typed and validated at application startup.
