import api, { routes } from './api';

export const browseProducts = async (params = {}) => {
  const response = await api.get(routes.products.browse, { params });
  return response.data;
};

export const searchProducts = async (keyword) => {
  const response = await api.get(routes.products.search, { params: { keyword } });
  return response.data;
};

export const filterProducts = async (category) => {
  const response = await api.get(routes.products.filter, { params: { category } });
  return response.data;
};

export const getFilterOptions = async () => {
  const response = await api.get(routes.products.filterOptions);
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

export const createProduct = async (payload) => {
  const response = await api.post(routes.products.create, payload);
  return response.data;
};

export const editProduct = async (id, payload) => {
  const response = await api.put(routes.products.edit(id), payload);
  return response.data;
};

export const withdrawProduct = async (id, action) => {
  const response = await api.put(routes.products.withdraw(id), { action });
  return response.data;
};

export const updateProductStock = async (id, stock) => {
  const response = await api.put(routes.products.updateStock(id), { stock });
  return response.data;
};

export const getLowStockProducts = async () => {
  const response = await api.get(routes.products.lowStock);
  return response.data;
};
