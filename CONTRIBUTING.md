# Contributing to SaaS Template

Thank you for your interest in contributing to the SaaS Template!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Follow the Getting Started guide in [README.md](./README.md)
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Project Structure

There is no root `package.json` — `web/`, `mobile/`, and `packages/shared/` are independent npm projects. `cd` into the one you're working on to run commands.

- `web/` - React Router 7 web application (owns the Drizzle schema in `web/app/db/schema.ts`)
- `mobile/` - Expo React Native mobile application
- `packages/shared/` - Shared TypeScript types

## Development Workflow

1. Make your changes
2. Test your changes from the relevant project directory:
   - Web: `cd web && npm run dev`
   - Mobile: `cd mobile && npm start` (or `npm run ios:device` / `npm run android:device`
     to run on a physical device over Wi-Fi — macOS only, it points
     Metro at your Mac's LAN IP via `ipconfig getifaddr en0`)
   - Type check: `npm run typecheck`
   - Tests: `npm run test`
   - Everything at once: `npm run check` (format + typecheck + test, plus build in `web/`)
3. Commit your changes with clear messages
4. Push to your fork
5. Create a Pull Request

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing

Before submitting a PR, ensure:

- [ ] Type checking passes: `npm run typecheck` (in each project you touched)
- [ ] Tests pass: `npm run test` (in each project you touched)
- [ ] Web app runs without errors
- [ ] Mobile app runs without errors
- [ ] No console errors or warnings
- [ ] Database migrations work correctly

## Pull Request Guidelines

1. **Title**: Use a clear, descriptive title
2. **Description**: Explain what changes you made and why
3. **Testing**: Describe how you tested your changes
4. **Screenshots**: Include screenshots for UI changes
5. **Breaking Changes**: Clearly note any breaking changes

## Coding Conventions

### TypeScript

```typescript
// Good: Clear types and names
interface User {
  id: string;
  email: string;
}

async function getUserById(userId: string): Promise<User | null> {
  return await db.user.findUnique({ where: { id: userId } });
}

// Bad: Unclear types and names
function get(id: any) {
  return db.user.findUnique({ where: { id } });
}
```

### React Components

```typescript
// Good: TypeScript with proper types
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Service Layer

When adding new services:

1. Create a new file in `web/app/services/`
2. Export functions with clear names
3. Add JSDoc comments
4. Follow the existing patterns

```typescript
/**
 * Example service function
 */
export async function doSomething(param: string): Promise<Result> {
  // Implementation
}
```

## Database Changes

When modifying the database schema:

1. Edit `web/app/db/schema.ts`
2. Apply the changes: `cd web && npm run db:push`
3. Update types in `packages/shared/src/types/`
4. Test with both web and mobile apps

## Adding Dependencies

- Add web-specific deps to `web/package.json`
- Add mobile-specific deps to `mobile/package.json`
- Add shared package deps to `packages/shared/package.json`

Always specify version ranges appropriately.

## Documentation

- Update README.md for major features and setup changes
- Add inline comments for complex logic
- Add examples for new features

## Questions?

Feel free to open an issue for:

- Bug reports
- Feature requests
- Documentation improvements
- Questions about the codebase

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
