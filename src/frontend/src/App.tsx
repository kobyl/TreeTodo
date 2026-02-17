import { useState } from 'react';
import type { CreateTaskRequest, UpdateTaskRequest } from './types';
import { useTaskApi } from './hooks/useTaskApi';
import { useTreeState } from './hooks/useTreeState';
import { TaskTree } from './components/TaskTree/TaskTree';
import { TaskForm } from './components/TaskForm/TaskForm';
import { Spinner } from './components/common/Spinner';
import { ErrorMessage } from './components/common/ErrorMessage';

function App() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, toggleTask } = useTaskApi();
  const treeState = useTreeState();
  const [showAddForm, setShowAddForm] = useState(false);

  async function handleCreate(data: CreateTaskRequest | UpdateTaskRequest) {
    const result = await createTask(data as CreateTaskRequest);
    if (result) {
      setShowAddForm(false);
    }
  }

  async function handleUpdate(id: number, data: UpdateTaskRequest) {
    await updateTask(id, data);
  }

  async function handleDelete(id: number) {
    await deleteTask(id);
  }

  async function handleToggle(id: number) {
    await toggleTask(id);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>TreeTodo</h1>
        <p>Task management with tree-structured hierarchy</p>
      </header>

      <main className="app-main">
        {error && <ErrorMessage message={error} />}

        <div className="toolbar">
          {!showAddForm && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              + New Task
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="add-task-form">
            <TaskForm onSubmit={handleCreate} onCancel={() => setShowAddForm(false)} />
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <Spinner />
          </div>
        ) : (
          <TaskTree
            tasks={tasks}
            treeState={treeState}
            onToggleComplete={handleToggle}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onCreate={data => createTask(data)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
