# Contributing to SaaS Template

Thank you for your interest in contributing to the SaaS Template!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Follow the [QUICKSTART.md](./QUICKSTART.md) guide
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Project Structure

- `web/` - React Router 7 web application
- `mobile/` - Expo React Native mobile application
- `packages/shared/` - Shared TypeScript types
- `prisma/` - Database schema and migrations

## Development Workflow

1. Make your changes
2. Test your changes:
   - Web: `npm run dev:web`
   - Mobile: `npm run dev:mobile`
   - Type check: `npm run typecheck`
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

- [ ] Type checking passes: `npm run typecheck`
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

1. Edit `prisma/schema.prisma`
2. Create a migration: `npm run db:migrate`
3. Update types in `packages/shared/src/types/`
4. Test with both web and mobile apps

## Adding Dependencies

- Add shared dependencies to root `package.json`
- Add web-specific deps to `web/package.json`
- Add mobile-specific deps to `mobile/package.json`
- Add shared package deps to `packages/shared/package.json`

Always specify version ranges appropriately.

## Documentation

- Update README.md for major features
- Add inline comments for complex logic
- Update SETUP.md if setup process changes
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
