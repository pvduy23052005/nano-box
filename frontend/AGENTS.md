<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nano Box — Frontend Agent Guide

## Overview

This file is the entry point for agents. It provides a high-level summary of the project and directs you to detailed references in `.agents/`.

## Tech Stack (Quick Reference)

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.10 |
| Language | TypeScript | ^5 |
| Runtime | React | 19.2.4 |
| Styling | Tailwind CSS v4 | no `tailwind.config.js` |
| UI | shadcn/ui (`base-nova`, `base`) | ^4.13.0 |
| Primitive | `@base-ui/react` | ^1.6.0 |
| Icons | `lucide-react` | ^1.23.0 |
| Forms | `react-hook-form` + `zod` | latest |
| Package manager | `pnpm` | — |

## Essential Commands

```bash
pnpm dev                              # Dev server → http://localhost:3000
pnpm build                            # Production build
pnpm lint                             # ESLint
npx tsc --noEmit                      # Type check
pnpm dlx shadcn@latest add <name>     # Add a shadcn component
pnpm dlx shadcn@latest info --json    # View project context & installed components
```

## Hard Rules

- **Never** edit files under `src/components/ui/` — override via `src/app/globals.css` using `[data-slot="<slot>"]` outside any `@layer`
- **Never** create new CSS files — all styles go in `src/app/globals.css`
- **Never** commit `.env` or secrets
- **Always** run `npx tsc --noEmit` after type-sensitive changes
- **Always** check installed components with `pnpm dlx shadcn@latest info --json` before adding new ones

## Project Rules in `.agents/rules/`

| File | What it covers |
|---|---|
| [`clean-components.md`](.agents/rules/clean-components.md) | Clean React/Next.js component decomposition, JSX shorthands, hooks, Tailwind styling, avoiding prop drilling |

## Detailed References in `.agents/`

All deep-dive documentation lives under `.agents/skills/shadcn/`:

| File | What it covers |
|---|---|
| [`SKILL.md`](.agents/skills/shadcn/SKILL.md) | Main shadcn skill — workflow, principles, CLI reference |
| [`rules/forms.md`](.agents/skills/shadcn/rules/forms.md) | FieldGroup, Field, validation states, InputGroup, ToggleGroup |
| [`rules/styling.md`](.agents/skills/shadcn/rules/styling.md) | Semantic colors, spacing, `cn()`, dark mode, z-index |
| [`rules/composition.md`](.agents/skills/shadcn/rules/composition.md) | Card, Tabs, Avatar, Alert, Empty, Toast, Skeleton, Badge |
| [`rules/icons.md`](.agents/skills/shadcn/rules/icons.md) | `data-icon` usage, no sizing classes on icons |
| [`rules/base-vs-radix.md`](.agents/skills/shadcn/rules/base-vs-radix.md) | `render` prop vs `asChild`, Base UI API differences |
| [`rules/chat.md`](.agents/skills/shadcn/rules/chat.md) | MessageScroller, Message, Bubble, Attachment, Marker |
| [`cli.md`](.agents/skills/shadcn/cli.md) | Full CLI command reference, flags, presets, templates |
| [`customization.md`](.agents/skills/shadcn/customization.md) | Theming, CSS variables, extending components |

> **Before writing any UI code**, read the relevant rule file above. Do not guess component APIs.
