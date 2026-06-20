---
description: Unit Testing guidelines and strategy for the Macro Service.
globs: ["src/**/*.ts"]
---

# Application Unit Tests

## Overview

The Unit Testing strategy for the Macro Service strictly follows the **Pareto Principle (80/20 rule)**.

Our core value and complexity lie in the business rules. Therefore, unit tests will exclusively target the `src/domain` (Enterprise Rules) and `src/application` (Use Cases) layers. We assume that third-party frameworks, database drivers, and external APIs (`src/infrastructure`) are already tested by their respective maintainers.

## Unit Tests Strategy

The application will follow a pragmatic Test-Driven Development (TDD) approach. To maintain clear living documentation, tests for every Use Case and Domain Entity are explicitly split into two files: Business tests and Functional/Edge-case tests.

### Business Unit Tests (`*.business.test.ts`)

This file is dedicated exclusively to the **Happy Path** (the core business rules). It validates what the application is primarily supposed to do. These tests should ideally be written *before* the code development to guide the design.

**Example:**
```typescript
// signIn.business.test.ts
test('Shoud sign-in and return the `access-token` and `refresh-token`', () => {
    ...
});
```

### Functional & Edge-Cases Unit Tests (`*.test.ts`)

This file contains the exhaustive functional validations, edge cases, and expected failures.

_Crucial Architecture Note_: Since these tests validate the `domain` and `application` layers, they **must not** check for HTTP status codes (like Bad Request or Internal Server Error). Instead, they must assert that the correct **Domain Errors** are thrown (e.g., `InvalidCredentialsError`, `ValidationError`).

**Example:**
```typescript
// signIn.business.test.ts
describe('Shoud test sign-in', () => {
    test('should throw InvalidCredentialsError if the user email is not found', () => {
        ...
    })
});
```

## Testing Patterns

- **Arrange-Act-Assert (AAA):** Structure all test blocks clearly using the AAA pattern. Set up the data (Arrange), execute the function (Act), and verify the outcome (Assert).
- **Mocking at the Edges:** Only mock the infrastructure ports (e.g., UserRepository, EmailService) that are injected into your Use Cases. Do not mock internal domain logic.
- **Immutability Check:** Ensure that Domain Entities remain valid and immutable after operations.
