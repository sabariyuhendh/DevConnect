import { useState, useEffect } from 'react';
import { apiRequest } from '@/config/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function useCaveTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiRequest('/api/cave/tasks', {
        method: 'GET'
      });
      setTasks(data.tasks || []);
    } catch (err: any) {
      console.error('❌ Failed to fetch tasks:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add task
  const addTask = async (title: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM') => {
    try {
      const data = await apiRequest('/api/cave/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, priority })
      });
      setTasks(prev => [data.task, ...prev]);
      return data.task;
    } catch (err: any) {
      console.error('❌ Failed to add task:', err);
      throw err;
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';

    try {
      const data = await apiRequest(`/api/cave/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      
      setTasks(prev => prev.map(t => 
        t.id === taskId ? data.task : t
      ));
    } catch (err: any) {
      console.error('❌ Failed to toggle task:', err);
      throw err;
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      await apiRequest(`/api/cave/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      console.error('❌ Failed to delete task:', err);
      throw err;
    }
  };

  // Update task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const data = await apiRequest(`/api/cave/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      setTasks(prev => prev.map(t => 
        t.id === taskId ? data.task : t
      ));
    } catch (err: any) {
      console.error('❌ Failed to update task:', err);
      throw err;
    }
  };

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    error,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    refetch: fetchTasks
  };
}
