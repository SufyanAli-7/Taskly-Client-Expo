import api from './api';
import { Platform } from 'react-native';

export const todoService = {
  /**
   * Fetch all todos for the current user
   */
  async getAllTodos() {
    const response = await api.get('/todos/all');
    return response.data?.todos || [];
  },

  /**
   * Fetch a single todo by its ID
   * @param {string} id
   */
  async getSingleTodo(id) {
    const response = await api.get(`/todos/single/${id}`);
    return response.data?.todos || null;
  },

  /**
   * Create a new todo task
   * @param {{ title: string, description?: string, dueDate?: string, priority?: string, imageUri?: string }} data
   */
  async createTodo(data) {
    const formData = new FormData();
    formData.append('title', (data.title || '').trim());
    formData.append('description', (data.description || '').trim());
    formData.append('dueDate', (data.dueDate || '').trim());
    formData.append('priority', data.priority || 'medium');

    if (data.imageUri) {
      const uri = data.imageUri;
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type,
      });
    }

    const response = await api.post('/todos/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Update an existing todo task
   * @param {{ id: string, title?: string, description?: string, dueDate?: string, priority?: string, status?: string, isCompleted?: boolean }} data
   */
  async updateTodo(data) {
    const response = await api.patch('/todos/update', {
      id: data.id,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
      isCompleted: data.isCompleted,
    });
    return response.data;
  },

  /**
   * Toggle completion status of a todo
   * @param {string} id
   * @param {boolean} currentCompleted
   * @param {object} fullTodo
   */
  async toggleComplete(id, currentCompleted, fullTodo = {}) {
    const newStatus = !currentCompleted;
    const response = await api.patch('/todos/update', {
      id,
      title: fullTodo.title,
      description: fullTodo.description,
      dueDate: fullTodo.dueDate,
      priority: fullTodo.priority,
      status: newStatus ? 'completed' : 'active',
      isCompleted: newStatus,
    });
    return response.data;
  },

  /**
   * Delete a todo task
   * @param {string} id
   */
  async deleteTodo(id) {
    const response = await api.delete(`/todos/single/${id}`);
    return response.data;
  },
};
