import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

/**
 * Wraps routes that require a logged-in customer.
 * Waits for Zustand to finish hydrating from localStorage before checking auth.
 * This prevents the "flash redirect to login" bug on page load/refresh.
 */
const CustomerProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, _hasHydrated } = useAuthStore();
  const location = useLocation();

  // Wait for the Zustand store to rehydrate from localStorage
  // before making any auth decisions
  if (!_hasHydrated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        flexDirection: 'column',
        gap: '16px',
        color: '#666'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #eee',
          borderTopColor: '#111',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default CustomerProtectedRoute;
