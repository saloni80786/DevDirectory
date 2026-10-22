import apiClient from './api';

export const getPosts = async ({ signal } = {}) => (await apiClient.get('/posts', { signal })).data;

export const getPostsByUser = async (userId, { signal } = {}) =>
  (await apiClient.get('/posts', { params: { userId }, signal })).data;

// Returns the full response so the form can check for 201 Created.
export const createPost = ({ title, body, userId }) => apiClient.post('/posts', { title, body, userId });
