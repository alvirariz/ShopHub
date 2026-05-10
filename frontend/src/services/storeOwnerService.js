import api, { routes } from './api';

export const getSales = async (params = {}) => {
  const response = await api.get(routes.storeOwner.sales, { params });
  return response.data;
};

export const getInsights = async (params = {}) => {
  const response = await api.get(routes.storeOwner.insights, { params });
  return response.data;
};
