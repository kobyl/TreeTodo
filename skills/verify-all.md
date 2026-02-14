# Skill: Verify All

Run full verification across backend and frontend.

## Steps

1. **Backend build + test:**
   ```bash
   cd src/backend && dotnet build && dotnet test --verbosity normal
   ```

2. **Frontend build + test:**
   ```bash
   cd src/frontend && npm run build && npm run test:run
   ```

3. **Report summary:**
   - Backend: build pass/fail, tests passed/failed
   - Frontend: build pass/fail, tests passed/failed
   - Any blocking issues

## When to use
- Before committing
- After major changes
- As a final check before PR
