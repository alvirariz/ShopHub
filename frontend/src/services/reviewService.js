import api, { routes } from './api';

export const getReviewsByProduct = async (productId) => {
  const response = await api.get(routes.reviews.byProduct(productId));
  return response.data;
};

export const submitReview = async (reviewData) => {
  const response = await api.post(routes.reviews.root, reviewData);
  return response.data;
};
