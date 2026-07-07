# NestJS Backend Architectural Guidelines & Project Coding Standards

This document defines the Hexagonal / Clean Architecture guidelines and Project Coding Standards applied to this project. All code changes or new module creations must strictly adhere to the instructions below.

---

## 1. Directory Structure

Each module (e.g., `user`) under `src/modules/` must follow the standard structure below:

```
src/modules/<module-name>/
├── domain /                    <-- IMPORTANT: Folder with a trailing space in the name "domain "
│   ├── <name>.entity.ts        <-- Domain Entity (business logic, Java-style getters)
│   └── <name>.type.ts          <-- Type definitions & Enums (e.g., status enums)
├── applications/
│   ├── ports/                  <-- Abstract classes defining ports/interfaces
│   │   ├── <name>.port.ts
│   │   └── <name>.interface.ts
│   └── use-case/               <-- Application services containing business execution logic
│       └── <name>.use-case.ts
├── infrastructure/
│   ├── databases/
│   │   ├── repositories/       <-- Concrete database adapters
│   │   └── schemas/            <-- Mongoose schema definitions
│   └── externals/              <-- External integrations like password-hasher.external.ts
└── presentation/
    └── graphql/                <-- GraphQL Resolvers
        ├── dto/                <-- Input/output DTOs (*.input.ts, *.payload.ts)
        └── <name>.resolver.ts
```

---

## 2. NestJS Architectural Conventions

### A. Domain Entities (`domain `)
- **Folder Path**: Must use the folder named `domain ` with a trailing space (`src/modules/user/domain /...`).
- **Java-style Getters**: Do not use TypeScript's property `get` syntax. Always implement explicit camelCase getter methods (e.g., `getId()`, `getName()`, `getEmail()`).
- **Encapsulated State**: Property fields must be `private`. Provide a `private constructor` and static factory methods:
  - `public static create(props): EntityName` - to create a new domain entity (status defaults to `ACTIVE`).
  - `public static restore(props): EntityName` - to restore an entity from the database.
- **No Framework Dependency**: Domain entities must never import database ORM libraries (Mongoose, etc.) or use database decorators.

### B. Ports & Adapters (Dependency Injection)
- **Ports**: Represented by `abstract class`es located in `applications/ports/` (e.g., `UserRepositoryAdapter` or `IPasswordHasher`).
- **Adapters**: Concrete implementation classes located in `infrastructure/` (e.g., `UserRepository` or `PasswordHasher`).
- **Binding**: Bind abstract ports to concrete adapters in the `providers` array of the NestJS module (e.g., `{ provide: UserRepositoryAdapter, useClass: UserRepository }`).

### C. Database (Mongoose)
- Mongoose schemas are located under `infrastructure/databases/schemas/`.
- Concrete Repositories should use `.lean().exec()` for read queries when model instances are not needed, and map persistence results back to Domain Entities using the entity's static `restore` method.

---

## 3. General Project Coding Standards

### A. Formatting
- Use **2 spaces** for indentation.
- Maximum of **100 characters** per line.
- Files must end with a **single empty line**.
- Use **single quotes (`'`)** for strings, except for JSX attributes.

### B. Naming Conventions

| Item | Convention | Example |
| :--- | :--- | :--- |
| Variables | camelCase | `userId`, `isVerified` |
| Functions | camelCase | `getUserById()`, `calculateTotal()` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_LIMIT`, `DEFAULT_STATUS` |
| Classes | PascalCase | `UserRepository`, `CreateUserUseCase` |
| Interfaces | PascalCase | `IUserRepository`, `UserProps` |
| Types | PascalCase | `UserRole`, `Nullable<T>` |
| React Components | PascalCase | `UserProfileCard`, `Button` |
| Hooks | useXxx | `useAuth`, `useLocalStorage` |
| JS/TS Files | kebab-case | `user-repository.ts`, `auth.resolver.ts` |
| React Component Files | PascalCase | `UserProfileCard.tsx` |
| CSS Classes | kebab-case | `btn-primary`, `nav-container` |

### C. Variables
- Prefer `const`.
- Only use `let` when the value needs to be reassigned.
- Do not use `var` under any circumstances.
- Use meaningful variable names that clearly express their purpose.

### D. Functions
- Each function should have a single responsibility.
- Prefer starting function names with a verb (e.g., `fetchData`, `validateInput`).
- Keep functions short, readable, and easy to maintain.
- Use an **options object** instead of passing multiple boolean parameters.
- Prefer arrow functions for simple transformations.

### E. Objects & Arrays
- Use destructuring where appropriate to extract properties/elements.
- Use the spread operator (`...`) for immutable updates.
- Use shorthand properties when property names match variable names.

### F. Async Code
- Prefer `async/await` over promise chaining (`.then()`).
- Always handle errors using `try/catch` blocks.
- Re-throw errors when necessary to preserve error context.

### G. Comments
- Only write comments for non-obvious design decisions or complex logic.
- Explain the **why** rather than describing the **what** of the code.
- Use JSDoc formatting for public APIs and exported functions.

### H. TypeScript
- Prefer `interface` for defining object shapes.
- Use `type` for unions, utility types, and mapped types.
- Avoid `any`. Use `unknown` if the data type is undetermined.
- Explicitly declare return types for all exported functions.

### I. Validation & Error Handling
- **DTO Validation**: Decorate input DTO fields with `class-validator` decorators including clear, custom error messages.
- **Global Pipes**: The application entry point uses `GraphQLValidationPipe` from `src/common/pipes/validator.pipe.ts`. This pipe formats errors under `extensions.errors` inside `GraphQLError`. Do not override this global pipe configuration.

### J. React (If Frontend development is involved)
- Only use Functional Components.
- Define the Props interface at the top of the component file.
- Custom hooks must start with the keyword `use`.
- Keep components small and focused on a single responsibility.

### K. Import Order
Order imports at the top of the file as follows (and alphabetically within each group if possible):
1. **External packages** (e.g., `nestjs`, `mongoose`, `next`, etc.)
2. **Internal aliases** (e.g., `@/...`)
3. **Relative imports** (e.g., `./...`, `../...`)

---

## 4. Code Review Checklist

Before completing a task or creating a Pull Request, self-review and ensure:

- [ ] No redundant debug statements like `console.log` (use NestJS Logger if needed).
- [ ] No commented-out code blocks.
- [ ] No unused variables, functions, or imports.
- [ ] Strict adherence to naming conventions and formatting (indentation).
- [ ] Async errors are caught and handled correctly.
- [ ] Never hardcode sensitive information (secrets, API keys) - use environment variables via ConfigService.
- [ ] No magic numbers without declaring constants or providing appropriate explanations.
- [ ] New code is fully consistent with the project's existing architecture and style.
- [ ] Directory structure of new modules complies with Hexagonal Architecture.
- [ ] The folder name `domain ` has a trailing space and domain entities use Java-style getters.
