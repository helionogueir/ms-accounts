---
description: Internationalization (i18n) strategy and guidelines for the Macro Service.
globs: ["src/**/*.ts"]
---

# Application Internationalization (i18n)

## Overview

The Macro Service supports multiple languages (i18n) primarily for transactional emails (e.g., password resets) and localized API error messages. We use **i18next** in the infrastructure layer to manage translation dictionaries securely and efficiently.

## Core Rules & Anti-Patterns

- **Frontend vs. Backend Responsibility:** The backend's primary responsibility is to return machine-readable error codes (e.g., `code: "INVALID_CREDENTIALS"`). Translating UI elements is the frontend's job. The backend only translates strings when it is the final renderer (e.g., generating an Email HTML body or an SMS).
- **The `Accept-Language` Header:** For synchronous API requests, the client's language preference is determined strictly by the `Accept-Language` HTTP header (e.g., `pt-BR`, `en-US`).
- **User Preference Fallback:** For background jobs or asynchronous events (where there is no HTTP header), the system must fallback to the `locale` preference saved in the User's database profile.
- **Always Have a Fallback:** If a translation key is missing for `pt-BR`, the system must gracefully fallback to the default language (usually `en`). Never render the raw translation key (e.g., `emails.welcome.subject`) to the end user.

## Dictionary Structure

Translation files are stored as JSON in the `src/infrastructure/i18n/locales` directory. They are organized by namespace and language to prevent massive, unmanageable files.

```text
src/infrastructure/i18n/locales/
├── en/
│   ├── errors.json
│   └── emails.json
└── pt/
    ├── errors.json
    └── emails.json
```

Example (en/emails.json):
```json
{
  "recovery": {
    "subject": "Reset your password",
    "body": "Hello {{name}}, click the link below to reset your password."
  }
}
```

## Clean Architecture Integration

1. **Domain Layer:** Knows nothing about i18n. It only throws structured errors.
```json
export class UserNotFoundError extends DomainError {
  constructor() { super('USER_NOT_FOUND'); }
}
```

2. **Application Layer (Use Cases):** Defines the `II18nService` port and uses it for things like sending emails.
```json
export interface II18nService {
  translate(key: string, locale: string, variables?: Record<string, any>): string;
}
```

3. **Presentation Layer (Controllers):** Extracts the `Accept-Language` header from the request and uses it to format the final Error Response if a Domain Error is caught.
4. **Infrastructure Layer:** Implements the i18next adapter.

## Example: Translation in a Controller (Error Handling)

```typescript
// presentation/controllers/auth.controller.ts
import { Request, Response } from 'express'; // or fastify
import { SignInUseCase } from '../../application/use-cases/signIn.use-case';
import { I18nAdapter } from '../../infrastructure/i18n/i18n.adapter';

export class AuthController {
  constructor(
    private signInUseCase: SignInUseCase,
    private i18n: I18nAdapter
  ) {}

  async handle(req: Request, res: Response) {
    // 1. Extract locale from header (e.g., 'pt-BR')
    const locale = req.acceptsLanguages()[0] || 'en';

    try {
      const { email, password } = req.body;
      const result = await this.signInUseCase.execute(email, password);
      
      return res.status(200).json({ data: result });
    } catch (error) {
      if (error.code) {
        // 2. Translate the domain error code into a human-readable message
        const message = this.i18n.translate(`errors:${error.code}`, locale);
        
        return res.status(400).json({
          error: {
            code: error.code,
            message: message
          }
        });
      }
      throw error; // Let the global error handler catch 500s
    }
  }
}
```
