import { useState } from 'react';
import type { CreateTaskRequest, UpdateTaskRequest, TodoTask } from '../../types';

export interface TaskFormProps {
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => void;
  onCancel?: () => void;
  initialData?: TodoTask;
  parentId?: number;
  isEditing?: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
}

export function TaskForm({ onSubmit, onCancel, initialData, parentId, isEditing = false }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>(initialData?.priority ?? 'Medium');
  const [dueDate, setDueDate] = useState(initialData?.dueDate?.split('T')[0] ?? '');
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const newErrors: FormErrors = {};
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Title is required';
    } else if (trimmedTitle.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }
    if (description && description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less';
    }
    if (dueDate) {
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime())) {
        newErrors.dueDate = 'Invalid date';
      }
    }
    return newErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});

    const data: CreateTaskRequest | UpdateTaskRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      ...(isEditing ? {} : { parentId }),
    };
    onSubmit(data);
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter task title"
          maxLength={200}
          autoFocus
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Optional description"
          maxLength={2000}
          rows={3}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            value={priority}
            onChange={e => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-due-date">Due Date</label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
          {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {isEditing ? 'Save' : 'Add Task'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
