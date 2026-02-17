import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  it('render_Default_ShowsTitleInput', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('submit_EmptyTitle_ShowsValidationError', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submit_ValidTitle_CallsOnSubmit', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Title'), 'New task');
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New task' })
    );
  });

  it('submit_WithAllFields_IncludesAllData', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Title'), 'Full task');
    await userEvent.type(screen.getByLabelText('Description'), 'A description');
    await userEvent.selectOptions(screen.getByLabelText('Priority'), 'High');

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Full task',
        description: 'A description',
        priority: 'High',
      })
    );
  });

  it('render_EditMode_ShowsSaveButton', () => {
    const task = {
      id: 1,
      title: 'Existing',
      description: null,
      isCompleted: false,
      priority: 'Medium' as const,
      dueDate: null,
      parentId: null,
      createdAt: '',
      updatedAt: '',
      sortOrder: 0,
      children: [],
    };
    render(<TaskForm onSubmit={vi.fn()} initialData={task} isEditing />);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Existing');
  });

  it('cancel_Click_CallsOnCancel', async () => {
    const onCancel = vi.fn();
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
