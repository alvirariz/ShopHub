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

export const cancelOrder = async (orderId) => {
  const response = await api.put(routes.orders.cancel(orderId));
  return response.data;
};

export const getIncomingOrders = async () => {
  const response = await api.get(routes.orders.incoming);
  return response.data;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const response = await api.put(routes.orders.updateStatus(orderId), { newStatus });
  return response.data;
};
