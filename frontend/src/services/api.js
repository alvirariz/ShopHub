import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    return Promise.reject({
      ...error,
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export const routes = {
  auth: {
    registerCustomer: '/auth/register-customer',
    registerStoreOwner: '/auth/register-store-owner',
    login: '/auth/login',
    logout: '/auth/logout',
  },
  products: {
    browse: '/products/browse',
    search: '/products/search',
    filter: '/products/filter',
    compare: '/products/compare',
    sort: '/products',
    details: (productId) => `/products/${productId}`,
    create: '/products',
    edit: (productId) => `/products/${productId}`,
    withdraw: (productId) => `/products/${productId}/withdraw`,
    updateStock: (productId) => `/products/${productId}/stock`,
    lowStock: '/products/low-stock',
  },
  cart: {
    root: '/cart',
    byUser: (userId) => `/cart/${userId}`,
    item: (itemId) => `/cart/item/${itemId}`,
    merge: '/cart/merge',
  },
  wishlist: {
    byUser: (userId) => `/wishlist/${userId}`,
    root: '/wishlist',
    item: (itemId) => `/wishlist/item/${itemId}`,
  },
  reviews: {
    byProduct: (productId) => `/reviews/${productId}`,
    root: '/reviews',
  },
  notifications: {
    byUser: (userId) => `/notifications/${userId}`,
    markRead: (notificationId) => `/notifications/${notificationId}/read`,
  },
  orders: {
    checkout: '/orders/checkout',
    history: (userId) => `/orders/history/${userId}`,
    track: (orderId) => `/orders/track/${orderId}`,
    incoming: '/orders/view',
    details: (orderId) => `/orders/${orderId}`,
    updateStatus: (orderId) => `/orders/${orderId}/status`,
  },
  preferences: {
    save: (userId) => `/preferences/${userId}`,
    recommendations: (userId) => `/preferences/${userId}/recommendations`,
  },
  admin: {
    metrics: '/admin/metrics',
    userStatus: (userId) => `/admin/users/${userId}/status`,
    applications: '/admin/applications',
    applicationDetails: (applicationId) => `/admin/applications/${applicationId}`,
    manageApplication: (applicationId) => `/admin/applications/${applicationId}`,
    users: '/admin/users',
  },
  storeOwner: {
    sales: '/storeowner/sales',
    insights: '/storeowner/insights',
  },
};

export const apiRequest = async (config) => {
  const response = await api(config);
  return response.data;
};

export default api;
