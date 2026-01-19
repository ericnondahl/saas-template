# @saas-template/shared

Shared TypeScript types and utilities for the SaaS template monorepo.

## Contents

- **Types**: Common type definitions used across web and mobile apps
  - User types and DTOs
  - API response structures
  - Pagination types

## Usage

```typescript
import { User, ApiResponse } from '@saas-template/shared';
```

## How It Works

This package uses the **internal package pattern** - both the web and mobile apps import the TypeScript source directly via tsconfig path aliases. There's no build step required.

- Changes to types are immediately available in all consuming apps
- Each app's bundler (Vite for web, Metro for mobile) handles TypeScript compilation
- No version management or publishing overhead

## Development

```bash
# Type check the shared package
npm run typecheck
```

To add new types:
1. Create or edit files in `src/types/`
2. Export them from `src/types/index.ts`
3. They're immediately available in web and mobile apps
