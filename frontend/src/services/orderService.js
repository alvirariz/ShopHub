import api, { routes } from './api';

export const checkout = async (checkoutData) => {
  const response = await api.post(routes.orders.checkout, checkoutData);
  return response.data;
};

export const getOrderHistory = async (userId) => {
  const response = await api.get(routes.orders.history(userId));
  return response.data;
};

export const trackOrder = async (orderId) => {
  const response = await api.get(routes.orders.track(orderId));
  return response.data;
};
