import api from './api';

export interface UserSearchResult {
  id: string;
  email: string;
  name: string;
}

export const searchUsers = (query: string) =>
  api.get<UserSearchResult[]>('/api/users/search', { params: { query } });
