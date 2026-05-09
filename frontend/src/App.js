import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ShoppingCartPage from './pages/Customer/ShoppingCartPage';
import ForYouPage from './pages/Customer/ForYouPage';
import ProductDetailsPage from './pages/Customer/ProductDetailsPage';
import CheckoutPage from './pages/Customer/CheckoutPage';
import BrowseProductsPage from './pages/Customer/BrowseProductsPage';
import OrderHistoryPage from './pages/Customer/OrderHistoryPage';
import NotificationsPage from './pages/Customer/NotificationsPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterCustomerPage from './pages/Auth/RegisterCustomerPage';
import RegisterStoreOwnerPage from './pages/Auth/RegisterStoreOwnerPage';
import CompareProductsPage from './pages/Customer/CompareProductsPage';
import { CompareProvider } from './contexts/CompareContext';
import CompareTray from './components/CompareTray';
import './App.css';

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
      <CompareTray />
    </div>
  );
}

function PlaceholderPage({ label }) {
  return (
    <div className="placeholder-page">
      <p>{label} — Coming Soon</p>
    </div>
  );
}

export default function App() {
  return (
    <CompareProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/for-you" replace />} />
          <Route path="for-you" element={<ForYouPage />} />
          <Route path="cart" element={<ShoppingCartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="products" element={<BrowseProductsPage />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />
          <Route path="compare" element={<CompareProductsPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="auth/login" element={<LoginPage />} />
          <Route path="auth/register-customer" element={<RegisterCustomerPage />} />
          <Route path="auth/register-store-owner" element={<RegisterStoreOwnerPage />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </CompareProvider>
  );
}
