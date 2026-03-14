# GitHub Copilot Instructions

> Coding standards, conventions, and architectural patterns for this project.
> Copilot must follow these guidelines when generating or suggesting code.

---

## Project Stack

| Layer | Technology |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| Data Fetching | Apollo Client + GraphQL |
| Language | TypeScript |
| Package Manager | pnpm (`pnpm-lock.yaml`) |
| Linting | ESLint (`eslint.config.js`, `.eslintrc`) |
| Routing | React Router (`src/router/index.tsx`) |

---

## Actual Project Structure

```
.agents/                        # AI agent skill definitions
.github/
  ├── ISSUE_TEMPLATE/           # GitHub issue templates
  ├── skills/                   # Copilot / agent skill markdown files
  └── workflows/                # CI/CD GitHub Actions
src/
  ├── components/
  │   ├── ui/                   # Primitive reusable UI components
  │   ├── types.ts              # Component-scoped TypeScript types
  │   └── VirtualizedList.tsx   # Shared virtualized list component
  ├── hooks/                    # Custom React hooks
  ├── pages/
  │   ├── CharacterDetail.tsx   # Detail page
  │   └── Home.tsx              # Home/landing page
  ├── router/
  │   └── index.tsx             # Route definitions
  ├── styles/
  │   └── index.css             # Global styles / Tailwind entry
  ├── App.tsx                   # Root app component
  └── index.tsx                 # Vite entry point
static/                         # Static public assets
index.html                      # Vite HTML template
```

---

## .agents/skills Folder

The `.agents/skills/` directory at the **project root** contains AI agent skill definition files. Each skill is a `.md` file describing a discrete capability.

### Skill File Format

```markdown
---
name: skill-name
description: One-line description of what this skill does.
triggers:
  - keyword or phrase
---

## Overview
## Input
## Output
## Steps
## Examples
```

### Skill Rules
- One responsibility per skill file — keep them **atomic**.
- File names must be `kebab-case.md`.
- Always check `.agents/skills/` before creating a new skill to avoid duplication.
- Skills may reference conventions defined in this file.

---

## React & Component Conventions

### General
- **Functional components only** — no class components.
- One component per file. Filename = component name in `PascalCase.tsx`.
- **Named exports** for all shared components. Default exports only for page components.

```tsx
// ✅ Shared component
export function UserCard({ user }: UserCardProps) { ... }

// ✅ Page component
export default function Home() { ... }
```

### Props
- Always define a typed `interface` or `type` for props — no `any`.
- Prefix event handler props with `on` (e.g. `onClick`, `onSelect`).

```tsx
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
}
```

### Types
- Shared/component-scoped types live in `src/components/types.ts`.
- Route/page-specific types belong in their respective file.
- GraphQL-generated types live in `src/graphql/generated/` (auto-generated — do not edit manually).

### Hooks
- All custom hooks live in `src/hooks/`.
- Hook names must start with `use`.
- Extract non-trivial logic out of components and into hooks.

```tsx
// src/hooks/useCharacters.ts
export function useCharacters(page: number) { ... }
```

---

## Routing — `src/router/index.tsx`

- All routes are defined centrally in `src/router/index.tsx`.
- Use `React Router v6` with `createBrowserRouter` or `<Routes>`.
- Lazy-load page components with `React.lazy` + `Suspense` for code splitting.

```tsx
const Home = React.lazy(() => import('@/pages/Home'));
const CharacterDetail = React.lazy(() => import('@/pages/CharacterDetail'));
```

- Use path params (`:id`) for detail pages. Access via `useParams()`.

---

## Tailwind CSS Conventions

### Rules
- Use **Tailwind utility classes** in JSX — no inline `style` props unless a dynamic value cannot be expressed as a class.
- Do not create additional CSS files. All global styles go in `src/styles/index.css`.
- Use `cn()` (clsx + tailwind-merge) for conditional/dynamic class composition.

```tsx
import { cn } from '@/utils/cn';

<div className={cn(
  'rounded-lg border p-4 transition-shadow',
  isSelected && 'border-blue-500 shadow-md',
  isDisabled && 'opacity-50 pointer-events-none'
)} />
```

### Responsiveness
- Mobile-first. Apply base styles first, then override with `sm:`, `md:`, `lg:`.

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
```

### Variants
- Use `cva` (class-variance-authority) for components with multiple visual states.

```tsx
import { cva } from 'class-variance-authority';

const button = cva('px-4 py-2 rounded font-medium transition-colors', {
  variants: {
    variant: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    },
  },
  defaultVariants: { variant: 'primary' },
});
```

---

## GraphQL + Apollo Conventions

### File Organisation
```
src/
└── graphql/
    ├── queries/       # .graphql query files
    ├── mutations/     # .graphql mutation files
    ├── fragments/     # Reusable fragments
    └── generated/     # codegen output — DO NOT EDIT
```

### Rules
- Write all queries/mutations in `.graphql` files — **never inline** `gql` template literals in component files.
- Import generated typed hooks from `src/graphql/generated/`.
- Always use **fragments** for repeated field selections.

```graphql
# src/graphql/fragments/CharacterFields.graphql
fragment CharacterFields on Character {
  id
  name
  status
  species
  image
}
```

```tsx
// ✅ Use generated hook
import { useGetCharactersQuery } from '@/graphql/generated';

export function Home() {
  const { data, loading, error } = useGetCharactersQuery({ variables: { page: 1 } });
  ...
}
```

### Apollo Client
- Apollo Client is configured in `src/lib/apollo/` (create if not present).
- Use `InMemoryCache` with explicit `keyFields` for all types that have an `id`.
- Handle `loading` and `error` states in every component that calls a query.

```tsx
if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error.message} />;
```

---

## VirtualizedList Component

`src/components/VirtualizedList.tsx` is the **standard** component for rendering large lists. Always use it when rendering collections that may exceed ~50 items.

```tsx
import { VirtualizedList } from '@/components/VirtualizedList';

<VirtualizedList
  items={characters}
  renderItem={(char) => <CharacterCard key={char.id} character={char} />}
/>
```

---

## File Naming Cheatsheet

| Asset | Convention | Example |
|---|---|---|
| Components | `PascalCase.tsx` | `CharacterCard.tsx` |
| Pages | `PascalCase.tsx` | `CharacterDetail.tsx` |
| Hooks | `camelCase.ts` prefixed `use` | `useCharacters.ts` |
| Utilities | `camelCase.ts` | `formatDate.ts` |
| GraphQL files | `PascalCase.graphql` | `GetCharacters.graphql` |
| Skill files | `kebab-case.md` | `write-query.md` |
| Types | `camelCase.ts` or co-located | `types.ts` |

---

## Linting & Code Style

- ESLint config is in `eslint.config.js` and `.eslintrc` — do not bypass with `// eslint-disable` unless there is a documented reason.
- No unused imports, no `any`, no `console.log` in committed code.
- Use absolute imports via the `@/` alias (configured in `vite.config.ts` and `tsconfig.json`).

```tsx
// ✅
import { VirtualizedList } from '@/components/VirtualizedList';

// ❌
import { VirtualizedList } from '../../components/VirtualizedList';
```

---

## CI/CD

- GitHub Actions workflows are in `.github/workflows/`.
- GitLab CI config is in `.gitlab-ci.yml` at the root.
- Do not commit directly to `main` — use feature branches and PRs.

---
