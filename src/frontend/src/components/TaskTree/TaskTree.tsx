import type { TodoTask, CreateTaskRequest, UpdateTaskRequest } from '../../types';
import type { UseTreeStateReturn } from '../../hooks/useTreeState';
import { TaskItem } from './TaskItem';

export interface TaskTreeProps {
  tasks: TodoTask[];
  treeState: UseTreeStateReturn;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: UpdateTaskRequest) => void;
  onCreate: (data: CreateTaskRequest) => void;
}

export function TaskTree({
  tasks,
  treeState,
  onToggleComplete,
  onDelete,
  onUpdate,
  onCreate,
}: TaskTreeProps) {
  function renderTasks(taskList: TodoTask[], depth: number) {
    return taskList.map(task => (
      <TaskItem
        key={task.id}
        task={task}
        depth={depth}
        isExpanded={treeState.isExpanded(task.id)}
        onToggleExpand={treeState.toggle}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onCreate={onCreate}
        renderChildren={(children, d) => renderTasks(children, d)}
      />
    ));
  }

  if (tasks.length === 0) {
    return <p className="empty-state">No tasks yet. Add one above!</p>;
  }

  return <div className="task-tree">{renderTasks(tasks, 0)}</div>;
}
