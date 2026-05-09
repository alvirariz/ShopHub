import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import {
  clearGuestCart,
  getCart,
  getGuestCartItems,
  mergeGuestCart,
  updateCartItemQuantity,
  removeCartItem,
} from '../../services/cartService';
import './ShoppingCartPage.css';

const formatPrice = (amount) =>
  `Rs. ${Number(amount).toLocaleString('en-IN')}`;

const normalizeCartItems = (items = []) =>
  items
    .filter((item) => item && item.product)
    .map((item) => ({
      ...item,
      id: item.id ?? `guest-${item.productId}`,
      productId: item.productId ?? item.product.id,
      quantity: Number(item.quantity) || 1,
      product: {
        ...item.product,
        price: Number(item.product.price) || 0,
        stock: Number(item.product.stock) || 0,
      },
    }));

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const userId = localStorage.getItem('userId');
      const guestItems = getGuestCartItems();

      if (userId && guestItems.length > 0) {
        const mergedCart = await mergeGuestCart(userId, guestItems);
        clearGuestCart();
        setCartItems(normalizeCartItems(mergedCart.cart?.cartItems));
        return;
      }

      const data = await getCart(userId);
      setCartItems(normalizeCartItems(data.cartItems));
    } catch (err) {
      setCartItems([]);
      setError(
        err.response?.data?.message ||
          'Could not load your cart. Please make sure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
    );

    try {
      await updateCartItemQuantity(itemId, newQty);
    } catch {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: currentQty } : item
        )
      );
    }
  };

  const handleRemove = async (itemId) => {
    const snapshot = [...cartItems];
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));

    try {
      await removeCartItem(itemId);
    } catch {
      setCartItems(snapshot);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <div className="customer-banner-header">
        <h1>Shopping Cart</h1>
      </div>

      <div className="cart-card">
        {loading ? (
          <div className="cart-status">Loading cart...</div>
        ) : error ? (
          <div className="cart-status cart-error">{error}</div>
        ) : cartItems.length === 0 ? (
          <div className="cart-status">Your cart is empty.</div>
        ) : (
          <div className="cart-table-wrapper">
            <table className="cart-table" aria-label="Shopping cart items">
              <thead>
                <tr>
                  <th className="col-items" scope="col">Items</th>
                  <th className="col-qty" scope="col">Quantity</th>
                  <th className="col-price" scope="col">Price</th>
                  <th className="col-delete" scope="col">
                    <span className="sr-only">Remove</span>
                  </th>
                  <th className="col-subtotal" scope="col">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="cart-row">
                    <td className="col-items">
                      <div className="item-info">
                        <span className="item-name">{item.product.name}</span>
                        <img
                          src={
                            item.product.imageUrl ||
                            `https://picsum.photos/seed/${item.productId}/80/80`
                          }
                          alt={item.product.name}
                          className="item-image"
                        />
                      </div>
                    </td>

                    <td className="col-qty">
                      <div className="qty-controls">
                        <button
                          className="qty-btn"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity, -1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.product.name}`}
                        >
                          -
                        </button>
                        <span className="qty-value" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity, 1)
                          }
                          disabled={
                            item.product.stock > 0 &&
                            item.quantity >= item.product.stock
                          }
                          aria-label={`Increase quantity of ${item.product.name}`}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="col-price">
                      <span className="price-text">
                        {formatPrice(item.product.price)}
                      </span>
                    </td>

                    <td className="col-delete">
                      <button
                        className="delete-btn"
                        onClick={() => handleRemove(item.id)}
                        aria-label={`Remove ${item.product.name} from cart`}
                        title="Remove item"
                      >
                        <Trash2 size={15} strokeWidth={1.8} />
                      </button>
                    </td>

                    <td className="col-subtotal">
                      <span className="subtotal-text">
                        {formatPrice(Number(item.product.price) * item.quantity)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="total-row">
                  <td colSpan={3} />
                  <td className="total-label">Total</td>
                  <td className="total-value">{formatPrice(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="cart-footer">
          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
