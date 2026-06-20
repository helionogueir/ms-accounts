---
description: Readability, Maintainability, and Clean Code guidelines for the Macro Service.
globs: ["src/**/*.ts"]
---

# Application Readability & Maintainability

## Overview

Code is read far more often than it is written. In the Macro Service, readability and maintainability are not optional—they are critical requirements. These guidelines ensure the codebase remains approachable, debuggable, and scalable for any engineer joining the team.

## 1. Size & Complexity (Single Responsibility)

- **Class Size:** Keep classes under ~300-500 lines. If a class grows larger, it likely violates the Single Responsibility Principle (SRP) and should be split into smaller, cohesive modules.
- **Function Size:** Keep functions small, ideally under ~40 lines. A function should do exactly one thing and do it well.
- **Deep Nesting:** Avoid nesting logic deeper than 3 levels (e.g., `if` inside `for` inside `if`).
  - *Fix:* Use the **Early Return / Guard Clause** pattern to handle errors and edge cases at the top of the function, keeping the "happy path" flat.

## 2. Naming & Typing

- **Explicit Naming:** Prohibit misleading, abbreviated, or highly generic names (e.g., `data`, `tmp`, `val`, `x`, `req`, `res`). Variables and functions must reveal their intent (e.g., `userData`, `hasActiveSession`, `findUserByEmail`).
- **Strict Typing:** All variables, function parameters, and class methods **must** have defined data types (either explicitly or via strict TS inference). Never use `any`. Explicit return types on functions are highly recommended to prevent accidental signature changes.
- **The Boolean Trap:** Avoid passing bare `true`/`false` flags into functions (e.g., `updateUser(user, true)`).
  - *Fix:* Use TypeScript `enum`s, distinct function names (`updateUserAndNotify()`), or named object parameters (`updateUser(user, { shouldNotify: true })`) to clarify intent.
- **No Magic Numbers or Strings:** Do not use raw literals in the code. Extract them into clearly named `const` variables, `enum`s, or configuration files (e.g., `const MAX_LOGIN_ATTEMPTS = 5` instead of just `5`).

## 3. Code Cleanliness & Documentation

- **JSDoc & Comments:** Public functions, classes, and complex interfaces must have JSDoc comments (`/** ... */`) explaining *what* they do and *why*, not *how*. Keep documentation strictly synchronized with the code.
- **No Dead Code:** Unreachable branches, unused imports, and unused variables must be removed.
- **No Commented-Out Code:** Do not leave blocks of commented-out code "just in case." Trust the Git version control history. Remove unnecessary or redundant comments (e.g., `// returns user` above a `return user` statement).

## 4. Structure & Duplication (DRY)

- **One Entity per File:** Define only one `class`, `interface`, `type`, or `enum` per file, and name the file accordingly (e.g., `user.entity.ts`, `user-role.enum.ts`). This makes navigating the codebase vastly easier.
- **Don't Repeat Yourself (DRY):** Flag copy-pasted blocks (≥ 5 near-identical lines).
  - *Fix:* Extract duplicated logic into shared utility functions, base classes, or shared Use Cases.
