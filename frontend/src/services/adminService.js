import api, { routes } from './api';

export const getMetrics = async () => {
  const response = await api.get(routes.admin.metrics);
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await api.get(routes.admin.userDetails(userId));
  return response.data;
};

export const updateUserStatus = async (userId, data) => {
  const response = await api.patch(routes.admin.userStatus(userId), data);
  return response.data;
};

export const getApplications = async () => {
  const response = await api.get(routes.admin.applications);
  return response.data;
};

export const manageApplication = async (applicationId, data) => {
  const response = await api.patch(routes.admin.manageApplication(applicationId), data);
  return response.data;
};

export const getUsers = async (query = '') => {
  const endpoint = routes.admin.users + (query ? `?q=${encodeURIComponent(query)}` : '');
  const response = await api.get(endpoint);
  return response.data;
};
