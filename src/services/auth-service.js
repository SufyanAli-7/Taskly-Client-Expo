import api from './api';

export const authService = {
  /**
   * Register a new user
   * @param {{ fullName: string, email: string, password: string }} data
   */
  async register(data) {
    const response = await api.post('/auth/register', {
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });
    return response.data;
  },

  /**
   * Login user with email and password
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const response = await api.post('/auth/login', {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
    return response.data;
  },

  /**
   * Fetch current authenticated user's profile
   */
  async getCurrentUser() {
    const response = await api.get('/auth/user');
    return response.data;
  },
};
