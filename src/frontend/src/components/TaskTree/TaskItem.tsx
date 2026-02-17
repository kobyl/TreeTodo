import { useState } from 'react';
import type { TodoTask, CreateTaskRequest, UpdateTaskRequest } from '../../types';
import { TaskForm } from '../TaskForm/TaskForm';
import { ConfirmDialog } from '../common/ConfirmDialog';

export interface TaskItemProps {
  task: TodoTask;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: UpdateTaskRequest) => void;
  onCreate: (data: CreateTaskRequest) => void;
  renderChildren: (children: TodoTask[], depth: number) => React.ReactNode;
}

const priorityLabels: Record<string, string> = {
  High: 'High',
  Medium: 'Med',
  Low: 'Low',
};

function formatDueDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString();
}

export function TaskItem({
  task,
  depth,
  isExpanded,
  onToggleExpand,
  onToggleComplete,
  onDelete,
  onUpdate,
  onCreate,
  renderChildren,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const hasChildren = task.children.length > 0;

  function handleEditSubmit(data: CreateTaskRequest | UpdateTaskRequest) {
    onUpdate(task.id, data as UpdateTaskRequest);
    setIsEditing(false);
  }

  function handleAddChildSubmit(data: CreateTaskRequest | UpdateTaskRequest) {
    onCreate({ ...(data as CreateTaskRequest), parentId: task.id });
    setIsAddingChild(false);
  }

  function handleConfirmDelete() {
    onDelete(task.id);
    setShowConfirmDelete(false);
  }

  if (isEditing) {
    return (
      <div className="task-item" style={{ paddingLeft: `${depth * 24}px` }}>
        <TaskForm
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
          initialData={task}
          isEditing
        />
      </div>
    );
  }

  return (
    <>
      <div
        className={`task-item ${task.isCompleted ? 'task-completed' : ''} priority-${task.priority.toLowerCase()}`}
        style={{ paddingLeft: `${depth * 24}px` }}
      >
        <div className="task-item-main">
          <button
            className="expand-toggle"
            onClick={() => onToggleExpand(task.id)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            disabled={!hasChildren}
            style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>

          <input
            type="checkbox"
            checked={task.isCompleted}
            onChange={() => onToggleComplete(task.id)}
            aria-label={`Mark "${task.title}" as ${task.isCompleted ? 'incomplete' : 'complete'}`}
          />

          <div className="task-content">
            <span className="task-title">{task.title}</span>
            {task.description && <span className="task-description">{task.description}</span>}
          </div>

          <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
            {priorityLabels[task.priority]}
          </span>

          {task.dueDate && (
            <span className="task-due-date">{formatDueDate(task.dueDate)}</span>
          )}

          <div className="task-actions">
            <button className="btn btn-small" onClick={() => setIsAddingChild(true)} aria-label="Add subtask">
              + Sub
            </button>
            <button className="btn btn-small" onClick={() => setIsEditing(true)} aria-label="Edit task">
              Edit
            </button>
            <button className="btn btn-small btn-danger" onClick={() => setShowConfirmDelete(true)} aria-label="Delete task">
              Del
            </button>
          </div>
        </div>
      </div>

      {isAddingChild && (
        <div className="task-item" style={{ paddingLeft: `${(depth + 1) * 24}px` }}>
          <TaskForm
            onSubmit={handleAddChildSubmit}
            onCancel={() => setIsAddingChild(false)}
            parentId={task.id}
          />
        </div>
      )}

      {isExpanded && hasChildren && renderChildren(task.children, depth + 1)}

      {showConfirmDelete && (
        <ConfirmDialog
          message={`Delete "${task.title}"${hasChildren ? ' and all subtasks' : ''}?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </>
  );
}
