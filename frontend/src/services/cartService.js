import api, { routes } from './api';

const GUEST_CART_KEY = 'guestCartItems';

const readGuestCart = () => {
  try {
    const storedCart = localStorage.getItem(GUEST_CART_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
};

const writeGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const getGuestCartItems = () => readGuestCart();

export const saveGuestCartItems = (items) => {
  writeGuestCart(items);
  return items;
};

export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};

export const getCart = async (userId) => {
  if (!userId) {
    return { cartItems: readGuestCart() };
  }

  try {
    const response = await api.get(routes.cart.byUser(userId));
    return response.data;
  } catch (error) {
    if (error.status === 404) {
      return { cartItems: [] };
    }
    throw error;
  }
};

export const addToCart = async (userId, productId, quantity) => {
  const response = await api.post(routes.cart.root, {
    userId,
    productId,
    quantity,
  });

  if (!userId) {
    const product = response.data.product;
    const cartItems = readGuestCart();
    const existingItem = cartItems.find(
      (item) => Number(item.productId) === Number(productId)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({
        id: `guest-${product.id}`,
        productId: product.id,
        quantity,
        product,
      });
    }

    writeGuestCart(cartItems);
    return { ...response.data, cartItems };
  }

  return response.data;
};

export const updateCartItemQuantity = async (itemId, quantity) => {
  if (String(itemId).startsWith('guest-')) {
    const cartItems = readGuestCart()
      .map((item) => (item.id === itemId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    writeGuestCart(cartItems);
    return { cartItems };
  }

  const response = await api.patch(routes.cart.item(itemId), { quantity });
  return response.data;
};

export const removeCartItem = async (itemId) => {
  if (String(itemId).startsWith('guest-')) {
    const cartItems = readGuestCart().filter((item) => item.id !== itemId);
    writeGuestCart(cartItems);
    return { cartItems };
  }

  const response = await api.delete(routes.cart.item(itemId));
  return response.data;
};

export const mergeGuestCart = async (userId, guestCartItems) => {
  const response = await api.post(routes.cart.merge, { userId, guestCartItems });
  return response.data;
};
