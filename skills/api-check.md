# Skill: API Check

Verify the backend API is running and all endpoints respond correctly.

## Prerequisites
- Backend must be running on http://localhost:5175

## Steps

1. Health check — GET /api/tasks should return 200:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:5175/api/tasks
   ```

2. Create a task — POST /api/tasks:
   ```bash
   curl -s -X POST http://localhost:5175/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"API check task","priority":"Medium"}'
   ```
   Expect: 201 with `success: true`

3. Read it back — GET /api/tasks/{id}:
   Expect: 200 with the created task

4. Create a child — POST /api/tasks with parentId:
   Expect: 201, child appears in parent's children array

5. Toggle completion — PATCH /api/tasks/{id}/toggle:
   Expect: 200, isCompleted flipped

6. Update — PUT /api/tasks/{id}:
   Expect: 200, fields updated

7. Delete — DELETE /api/tasks/{id}:
   Expect: 204, task and children gone

8. Report pass/fail for each endpoint
