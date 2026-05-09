import api, { routes } from './api';

export const login = async (email, password) => {
  const response = await api.post(routes.auth.login, { email, password });
  return response.data;
};

export const registerCustomer = async (formData) => {
  const response = await api.post(routes.auth.registerCustomer, formData);
  return response.data;
};

export const registerStoreOwner = async (formData) => {
  const response = await api.post(routes.auth.registerStoreOwner, formData);
  return response.data;
};
