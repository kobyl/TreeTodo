# Skill: Test Frontend

Run the React frontend test suite and report results.

## Steps

1. Ensure the project builds:
   ```bash
   cd src/frontend && npm run build
   ```

2. Run all tests in single-run mode:
   ```bash
   npm run test:run
   ```

3. If tests fail:
   - Read the failing test file
   - Read the component/hook/service under test
   - Identify the mismatch
   - Fix the implementation (not the test, unless the test is wrong)
   - Re-run tests

4. Report:
   - Total tests: passed / failed / skipped
   - Any failures with file:line references
