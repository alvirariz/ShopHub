import api, { routes } from './api';

export const getUserNotifications = async (userId) => {
  const response = await api.get(routes.notifications.byUser(userId));
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await api.patch(routes.notifications.markRead(notificationId));
  return response.data;
};
