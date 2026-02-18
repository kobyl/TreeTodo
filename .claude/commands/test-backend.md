# Skill: Test Backend

Run the .NET backend test suite and report results.

## Steps

1. Ensure the solution builds:
   ```bash
   cd src/backend && dotnet build --no-restore
   ```

2. Run all tests:
   ```bash
   dotnet test --verbosity normal --logger "console;verbosity=detailed"
   ```

3. If tests fail:
   - Read the failing test file
   - Read the implementation file under test
   - Identify the mismatch
   - Fix the implementation (not the test, unless the test is wrong)
   - Re-run tests

4. Report:
   - Total tests: passed / failed / skipped
   - Any failures with file:line references
