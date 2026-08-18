import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './components/common/ToastContext';
import api from './utils/api';
import useThemeStore from './store/useThemeStore';
import useAuthStore from './store/useAuthStore';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PageTransition from './components/layout/PageTransition';
import AnnouncementBar from './components/layout/AnnouncementBar';
import ScrollToTop from './components/common/ScrollToTop';

import CustomerLayout from './components/customer/CustomerLayout';
import CartDrawer from './components/checkout/CartDrawer';
import CustomerProtectedRoute from './components/customer/CustomerProtectedRoute';

import { GoogleOAuthProvider } from '@react-oauth/google';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

// Lazy Loaded Pages
const OrderHistory = React.lazy(() => import('./pages/customer/OrderHistory'));
const Profile = React.lazy(() => import('./pages/customer/Profile'));
const Addresses = React.lazy(() => import('./pages/customer/Addresses'));
const Checkout = React.lazy(() => import('./pages/public/Checkout'));
const OrderConfirmation = React.lazy(() => import('./pages/public/OrderConfirmation'));
const Home = React.lazy(() => import('./pages/public/Home'));
const Shop = React.lazy(() => import('./pages/public/Shop'));
const ProductDetail = React.lazy(() => import('./pages/public/ProductDetail'));
const Collections = React.lazy(() => import('./pages/public/Collections'));
const Login = React.lazy(() => import('./pages/public/Login'));
const Register = React.lazy(() => import('./pages/public/Register'));
const CompleteProfile = React.lazy(() => import('./pages/public/CompleteProfile'));
const CampaignLandingPage = React.lazy(() => import('./pages/public/CampaignLandingPage'));
const BoxBuilderPage = React.lazy(() => import('./pages/public/BoxBuilderPage'));
const StaticPage = React.lazy(() => import('./pages/public/StaticPage'));
const FaqPage = React.lazy(() => import('./pages/public/FaqPage'));
const VerifyEmail = React.lazy(() => import('./pages/public/VerifyEmail'));
const ForgotPassword = React.lazy(() => import('./pages/public/ForgotPassword'));

// Lazy Loaded Admin Pages
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminTwoFactorVerify = React.lazy(() => import('./pages/admin/AdminTwoFactorVerify'));
const AdminTwoFactorSetup = React.lazy(() => import('./pages/admin/AdminTwoFactorSetup'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const Products = React.lazy(() => import('./pages/admin/Products'));
const ProductForm = React.lazy(() => import('./pages/admin/ProductForm'));
const AdminCollections = React.lazy(() => import('./pages/admin/Collections'));
const AdminCollectionDetail = React.lazy(() => import('./pages/admin/CollectionDetail'));
const Orders = React.lazy(() => import('./pages/admin/Orders'));
const OrderDetail = React.lazy(() => import('./pages/admin/OrderDetail'));
const Returns = React.lazy(() => import('./pages/admin/Returns'));
const ReturnDetail = React.lazy(() => import('./pages/admin/ReturnDetail'));
const Customers = React.lazy(() => import('./pages/admin/Customers'));
const CustomerDetail = React.lazy(() => import('./pages/admin/CustomerDetail'));
const Coupons = React.lazy(() => import('./pages/admin/Coupons'));
const ReviewsModeration = React.lazy(() => import('./pages/admin/ReviewsModeration'));
const Pincodes = React.lazy(() => import('./pages/admin/Pincodes'));
const LowStock = React.lazy(() => import('./pages/admin/LowStock'));
const Settings = React.lazy(() => import('./pages/admin/Settings'));
const AdminPromotions = React.lazy(() => import('./pages/admin/Promotions'));
const AdminCategoryAttributes = React.lazy(() => import('./pages/admin/CategoryAttributes'));
const AdminBoxBuilder = React.lazy(() => import('./pages/admin/BoxBuilder'));
const AdminStaticPages = React.lazy(() => import('./pages/admin/StaticPages'));
const AdminFaqManagement = React.lazy(() => import('./pages/admin/FaqManagement'));
const ThemeCustomizer = React.lazy(() => import('./pages/admin/ThemeCustomizer'));

// Sub-dashboards
const FinancialDashboard = React.lazy(() => import('./pages/admin/dashboards/FinancialDashboard'));
const MarketingDashboard = React.lazy(() => import('./pages/admin/dashboards/MarketingDashboard'));
const SupplyChainDashboard = React.lazy(() => import('./pages/admin/dashboards/SupplyChainDashboard'));
const CRMDashboard = React.lazy(() => import('./pages/admin/dashboards/CRMDashboard'));

// Layout wrapper for customer facing pages
const StoreLayout = ({ children }) => {
  const { user } = useAuthStore();

  return (
    <div className="store-layout">
      <Header />
      <CartDrawer />
      <main className="main-content" style={{ minHeight: 'calc(100vh - 200px)', padding: 'var(--spacing-xl) 0', overflow: 'hidden' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: 'var(--spacing-xxl)' }}>Loading...</div>}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const AboutUs = React.lazy(() => import('./pages/public/AboutUs'));
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public / Customer Routes */}
        <Route path="/" element={<StoreLayout><PageTransition><Home /></PageTransition></StoreLayout>} />
        <Route path="/shop" element={<StoreLayout><PageTransition><Shop /></PageTransition></StoreLayout>} />
        <Route path="/product/:slug" element={<StoreLayout><PageTransition><ProductDetail /></PageTransition></StoreLayout>} />
        <Route path="/collections" element={<StoreLayout><PageTransition><Collections /></PageTransition></StoreLayout>} />
        <Route path="/about" element={<StoreLayout><PageTransition><AboutUs /></PageTransition></StoreLayout>} />
        
        {/* Customer Auth Routes */}
        <Route path="/login" element={<StoreLayout><PageTransition><Login /></PageTransition></StoreLayout>} />
        <Route path="/register" element={<StoreLayout><PageTransition><Register /></PageTransition></StoreLayout>} />
        <Route path="/complete-profile" element={<StoreLayout><PageTransition><CompleteProfile /></PageTransition></StoreLayout>} />
        <Route path="/verify-email" element={<StoreLayout><PageTransition><VerifyEmail /></PageTransition></StoreLayout>} />
        <Route path="/forgot-password" element={<StoreLayout><PageTransition><ForgotPassword /></PageTransition></StoreLayout>} />
        <Route path="/checkout" element={<CustomerProtectedRoute><StoreLayout><Checkout /></StoreLayout></CustomerProtectedRoute>} />
        <Route path="/order-confirmation" element={<StoreLayout><OrderConfirmation /></StoreLayout>} />
        <Route path="/campaign/:id" element={<StoreLayout><CampaignLandingPage /></StoreLayout>} />
        <Route path="/box-builder/:slug" element={<StoreLayout><BoxBuilderPage /></StoreLayout>} />
        <Route path="/page/:slug" element={<StoreLayout><StaticPage /></StoreLayout>} />
        <Route path="/faq" element={<StoreLayout><FaqPage /></StoreLayout>} />
        
        {/* Protected Customer Dashboard Routes */}
        <Route path="/profile" element={<CustomerProtectedRoute><StoreLayout><PageTransition><CustomerLayout><Profile /></CustomerLayout></PageTransition></StoreLayout></CustomerProtectedRoute>} />
        <Route path="/orders" element={<CustomerProtectedRoute><StoreLayout><PageTransition><CustomerLayout><OrderHistory /></CustomerLayout></PageTransition></StoreLayout></CustomerProtectedRoute>} />
        <Route path="/addresses" element={<CustomerProtectedRoute><StoreLayout><PageTransition><CustomerLayout><Addresses /></CustomerLayout></PageTransition></StoreLayout></CustomerProtectedRoute>} />

        {/* Admin Auth Routes (Unprotected) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/2fa-verify" element={<AdminTwoFactorVerify />} />
        <Route path="/admin/2fa-setup" element={<AdminTwoFactorSetup />} />

        {/* Admin Routes (Protected) */}
        <Route path="/admin" element={<AdminProtectedRoute><AdminLayout><Dashboard /></AdminLayout></AdminProtectedRoute>} />
        
        {/* Analytics Sub-Dashboards */}
        <Route path="/admin/analytics/financial" element={<AdminProtectedRoute><AdminLayout><FinancialDashboard /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/analytics/marketing" element={<AdminProtectedRoute><AdminLayout><MarketingDashboard /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/analytics/supply-chain" element={<AdminProtectedRoute><AdminLayout><SupplyChainDashboard /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/analytics/crm" element={<AdminProtectedRoute><AdminLayout><CRMDashboard /></AdminLayout></AdminProtectedRoute>} />

        <Route path="/admin/products" element={<AdminProtectedRoute><AdminLayout><Products /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/products/new" element={<AdminProtectedRoute><AdminLayout><ProductForm /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/products/:id/edit" element={<AdminProtectedRoute><AdminLayout><ProductForm /></AdminLayout></AdminProtectedRoute>} />
        
        <Route path="/admin/collections" element={<AdminProtectedRoute><AdminLayout><AdminCollections /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/collections/:id" element={<AdminProtectedRoute><AdminLayout><AdminCollectionDetail /></AdminLayout></AdminProtectedRoute>} />
        
        <Route path="/admin/orders" element={<AdminProtectedRoute><AdminLayout><Orders /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/orders/:id" element={<AdminProtectedRoute><AdminLayout><OrderDetail /></AdminLayout></AdminProtectedRoute>} />
        
        <Route path="/admin/returns" element={<AdminProtectedRoute><AdminLayout><Returns /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/returns/:id" element={<AdminProtectedRoute><AdminLayout><ReturnDetail /></AdminLayout></AdminProtectedRoute>} />
        
        <Route path="/admin/customers" element={<AdminProtectedRoute><AdminLayout><Customers /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/customers/:id" element={<AdminProtectedRoute><AdminLayout><CustomerDetail /></AdminLayout></AdminProtectedRoute>} />
        
        <Route path="/admin/coupons" element={<AdminProtectedRoute><AdminLayout><Coupons /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/reviews" element={<AdminProtectedRoute><AdminLayout><ReviewsModeration /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/pincodes" element={<AdminProtectedRoute><AdminLayout><Pincodes /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/low-stock" element={<AdminProtectedRoute><AdminLayout><LowStock /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/settings" element={<AdminProtectedRoute><AdminLayout><Settings /></AdminLayout></AdminProtectedRoute>} />
        
        <Route path="/admin/promotions" element={<AdminProtectedRoute><AdminLayout><AdminPromotions /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/category-attributes" element={<AdminProtectedRoute><AdminLayout><AdminCategoryAttributes /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/box-builders" element={<AdminProtectedRoute><AdminLayout><AdminBoxBuilder /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/static-pages" element={<AdminProtectedRoute><AdminLayout><AdminStaticPages /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/faqs" element={<AdminProtectedRoute><AdminLayout><AdminFaqManagement /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/appearance" element={<AdminProtectedRoute><AdminLayout><ThemeCustomizer /></AdminLayout></AdminProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

// Removed imports
function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'missing_client_id';

  useEffect(() => {
    api.get('/theme')
      .then(res => {
        const theme = res.data.data;
        if (theme) {
          const root = document.documentElement;
          if (theme.primaryColor) root.style.setProperty('--color-primary', theme.primaryColor);
          if (theme.secondaryColor) root.style.setProperty('--color-secondary', theme.secondaryColor);
          if (theme.accentColor) root.style.setProperty('--color-accent', theme.accentColor);
          if (theme.backgroundColor) root.style.setProperty('--color-background', theme.backgroundColor);
          if (theme.textColor) root.style.setProperty('--color-text-main', theme.textColor);
          
          if (theme.headingFont) root.style.setProperty('--font-heading', `"${theme.headingFont}", serif`);
          if (theme.bodyFont) root.style.setProperty('--font-body', `"${theme.bodyFont}", sans-serif`);
          
          if (theme.buttonStyle === 'sharp') root.style.setProperty('--button-radius', '0px');
          else if (theme.buttonStyle === 'pill') root.style.setProperty('--button-radius', '50px');
          else root.style.setProperty('--button-radius', '2px');
          
          useThemeStore.getState().setTheme(theme);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <ScrollToTop />
        <ToastProvider>
          <AnimatedRoutes />
        </ToastProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

