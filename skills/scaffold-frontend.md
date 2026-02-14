# Skill: Scaffold Frontend

The baseline React + TypeScript + Vite app is already scaffolded in `src/frontend/`. This skill documents what exists and what the frontend agent needs to implement.

## Already Done (baseline)

- Vite + React 19 + TypeScript project
- Dev/test dependencies installed (vitest, testing-library, msw, jsdom)
- `vite.config.ts` with proxy to localhost:5175 and vitest config
- `tsconfig.app.json` with vitest/globals types
- `src/types/index.ts` with TypeScript interfaces matching API contract
- `src/services/api.ts` — fully typed fetch wrapper for all endpoints
- `src/test/setup.ts` importing jest-dom matchers
- `src/test/mocks/handlers.ts` — MSW v2 handler stubs
- `package.json` scripts: test, test:run, test:coverage

## What to Implement

1. Build UI components in `src/components/`:
   - `TaskTree/` — recursive tree rendering with expand/collapse
   - `TaskForm/` — create/edit task form with validation
   - `common/` — shared UI elements (buttons, modals, spinners)
2. Create custom hooks in `src/hooks/`:
   - `useTaskApi` — wraps taskApi with loading/error state
   - `useTreeState` — manages tree expand/collapse state
3. Wire up `App.tsx` with components and hooks
4. Add styles (CSS Modules or index.css)
5. Flesh out MSW mock handlers with realistic test data
6. Write tests for all components, hooks, and services

## Validation
- `npm run build` succeeds
- `npm run test:run` passes
- `npm run dev` serves on http://localhost:5173
