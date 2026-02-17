import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TodoTask } from '../../types';
import { TaskTree } from './TaskTree';

const mockTreeState = {
  expandedIds: new Set<number>(),
  toggle: vi.fn(),
  expand: vi.fn(),
  collapse: vi.fn(),
  expandAll: vi.fn(),
  collapseAll: vi.fn(),
  isExpanded: vi.fn(() => false),
};

const mockTasks: TodoTask[] = [
  {
    id: 1,
    title: 'Root task',
    description: 'A root task',
    isCompleted: false,
    priority: 'High',
    dueDate: '2026-03-01T00:00:00.000Z',
    parentId: null,
    createdAt: '2026-02-15T00:00:00.000Z',
    updatedAt: '2026-02-15T00:00:00.000Z',
    sortOrder: 0,
    children: [
      {
        id: 2,
        title: 'Child task',
        description: null,
        isCompleted: false,
        priority: 'Medium',
        dueDate: null,
        parentId: 1,
        createdAt: '2026-02-15T00:00:00.000Z',
        updatedAt: '2026-02-15T00:00:00.000Z',
        sortOrder: 0,
        children: [],
      },
    ],
  },
];

describe('TaskTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTreeState.isExpanded.mockReturnValue(false);
  });

  it('render_EmptyTasks_ShowsEmptyState', () => {
    render(
      <TaskTree
        tasks={[]}
        treeState={mockTreeState}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        onCreate={vi.fn()}
      />
    );
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('render_WithTasks_ShowsTaskTitles', () => {
    render(
      <TaskTree
        tasks={mockTasks}
        treeState={mockTreeState}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        onCreate={vi.fn()}
      />
    );
    expect(screen.getByText('Root task')).toBeInTheDocument();
  });

  it('render_CollapsedParent_HidesChildren', () => {
    render(
      <TaskTree
        tasks={mockTasks}
        treeState={mockTreeState}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        onCreate={vi.fn()}
      />
    );
    expect(screen.queryByText('Child task')).not.toBeInTheDocument();
  });

  it('render_ExpandedParent_ShowsChildren', () => {
    mockTreeState.isExpanded.mockReturnValue(true);
    render(
      <TaskTree
        tasks={mockTasks}
        treeState={mockTreeState}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        onCreate={vi.fn()}
      />
    );
    expect(screen.getByText('Child task')).toBeInTheDocument();
  });

  it('toggle_ClickCheckbox_CallsOnToggleComplete', async () => {
    const onToggle = vi.fn();
    render(
      <TaskTree
        tasks={mockTasks}
        treeState={mockTreeState}
        onToggleComplete={onToggle}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        onCreate={vi.fn()}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('render_HighPriority_ShowsHighBadge', () => {
    render(
      <TaskTree
        tasks={mockTasks}
        treeState={mockTreeState}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        onCreate={vi.fn()}
      />
    );
    expect(screen.getByText('High')).toBeInTheDocument();
  });
});
