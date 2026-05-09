import { apiRequest, routes } from './api';

export const getWishlist = async (userId) => {
  return apiRequest({
    method: 'GET',
    url: routes.wishlist.byUser(userId),
  });
};

export const addToWishlist = async (userId, productId) => {
  return apiRequest({
    method: 'POST',
    url: routes.wishlist.root,
    data: { userId, productId },
  });
};

export const removeFromWishlist = async (userId, productId) => {
  return apiRequest({
    method: 'DELETE',
    url: routes.wishlist.item(productId),
    data: { userId },
  });
};
