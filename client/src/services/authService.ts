import api from './api';
import type { AuthResponse } from '../types';

export const register = (email: string, password: string, name: string) =>
  api.post<AuthResponse>('/api/auth/register', { email, password, name });

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/api/auth/login', { email, password });
