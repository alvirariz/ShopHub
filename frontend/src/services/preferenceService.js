import api, { routes } from './api';

export const savePreferences = async (userId, preferences) => {
  const response = await api.post(routes.preferences.save(userId), { preferences });
  return response.data;
};

export const getRecommendations = async (userId) => {
  const response = await api.get(routes.preferences.recommendations(userId));
  return response.data;
};
