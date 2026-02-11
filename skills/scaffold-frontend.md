# Skill: Scaffold Frontend

Scaffold the React + TypeScript + Vite frontend from scratch.

## Steps

1. Create Vite project:
   ```bash
   cd frontend && npm create vite@latest . -- --template react-ts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install dev/test dependencies:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
   ```

4. Configure Vite proxy in `vite.config.ts`:
   ```ts
   server: {
     proxy: { '/api': 'http://localhost:5175' }
   }
   ```

5. Configure Vitest in `vite.config.ts`:
   ```ts
   test: {
     globals: true,
     environment: 'jsdom',
     setupFiles: './src/test/setup.ts'
   }
   ```

6. Create project structure:
   ```
   src/
   ├── components/
   │   ├── TaskTree/
   │   ├── TaskForm/
   │   └── common/
   ├── hooks/
   ├── services/
   ├── types/
   └── test/
       ├── setup.ts
       └── mocks/handlers.ts
   ```

7. Create TypeScript interfaces in `types/` matching the API contract in `docs/agent-coordination.md`
8. Create `services/api.ts` — fetch wrapper with typed methods for all endpoints
9. Create MSW mock handlers matching the API contract
10. Create `test/setup.ts` importing jest-dom matchers
11. Add npm scripts to package.json:
    ```json
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
    ```

## Validation
- `npm run build` succeeds
- `npm run test:run` passes
- `npm run dev` serves on http://localhost:5173
