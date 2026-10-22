import apiClient from './api';
import { enrichUser } from '../utils/indianProfiles';

let usersCache = null; // one shared request for the whole session

export const getUsers = () => {
  if (!usersCache) {
    usersCache = apiClient
      .get('/users')
      .then((res) => res.data.map(enrichUser))
      .catch((err) => {
        usersCache = null; // let "Retry" hit the network again
        throw err;
      });
  }
  return usersCache;
};

export const getUserById = async (id, { signal } = {}) => {
  const res = await apiClient.get(`/users/${id}`, { signal });
  return enrichUser(res.data);
};
