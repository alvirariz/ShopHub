import api, { routes } from './api';

export const browseProducts = async (params = {}) => {
  const response = await api.get(routes.products.browse, { params });
  return response.data;
};

export const searchProducts = async (keyword) => {
  const response = await api.get(routes.products.search, { params: { keyword } });
  return response.data;
};

export const getProductDetails = async (productId) => {
  const response = await api.get(routes.products.details(productId));
  return response.data;
};

export const compareProducts = async (ids) => {
  const response = await api.get(`${routes.products.compare}?ids=${ids}`);
  return response.data;
};
