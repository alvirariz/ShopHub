import api, { routes } from './api';

export const getSales = async () => {
  const response = await api.get(routes.storeOwner.sales);
  return response.data;
};

export const getInsights = async () => {
  const response = await api.get(routes.storeOwner.insights);
  return response.data;
};
