import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/layout/ToastContainer';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import About from './pages/About';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCategoryForm from './pages/admin/AdminCategoryForm';
import AdminWhatsApp from './pages/admin/WhatsAppConnect';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';
import AdminStockAlerts from './pages/admin/AdminStockAlerts';
import AdminReports from './pages/admin/AdminReports';

// Components
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import Footer from './components/layout/Footer';

// Private Route Component (Any Logged In User)
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-paper">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div>
        </div>
    );

    return user ? children : <Navigate to="/login" />;
};

// Admin Route Component (Only Admin User)
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-paper">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div>
        </div>
    );

    // Si no está logueado, al login
    if (!user) return <Navigate to="/login" />;

    // Si está logueado pero NO es admin, al perfil de cliente
    if (user.role !== 'admin') return <Navigate to="/perfil" />;

    return children;
};

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <CartProvider>
                    <ErrorBoundary>
                        <Router>
                            <div className="App flex flex-col min-h-screen">
                                <ToastContainer />
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/product/:id" element={<ProductDetail />} />
                                    <Route path="/productos" element={<Products />} />
                                    <Route path="/nosotros" element={<About />} />
                                    <Route path="/checkout" element={<Checkout />} />
                                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/registro" element={<Register />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                                    <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />

                                    {/* Admin Protected Routes */}
                                    <Route
                                        path="/admin"
                                        element={
                                            <AdminRoute>
                                                <AdminDashboard />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/products"
                                        element={
                                            <AdminRoute>
                                                <AdminProducts />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/orders"
                                        element={
                                            <AdminRoute>
                                                <AdminOrders />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/categories"
                                        element={
                                            <AdminRoute>
                                                <AdminCategories />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/categories/new"
                                        element={
                                            <AdminRoute>
                                                <AdminCategoryForm />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/categories/edit/:id"
                                        element={
                                            <AdminRoute>
                                                <AdminCategoryForm />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/products/new"
                                        element={
                                            <AdminRoute>
                                                <AdminProductForm />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/products/edit/:id"
                                        element={
                                            <AdminRoute>
                                                <AdminProductForm />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/whatsapp"
                                        element={
                                            <AdminRoute>
                                                <AdminWhatsApp />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/settings"
                                        element={
                                            <AdminRoute>
                                                <AdminSettings />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/coupons"
                                        element={
                                            <AdminRoute>
                                                <AdminCoupons />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/reviews"
                                        element={
                                            <AdminRoute>
                                                <AdminReviews />
                                            </AdminRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/stock-alerts"
                                        element={
                                            <AdminRoute>
                                                <AdminStockAlerts />
                                            </AdminRoute>
                                        }

                                    />
                                    <Route
                                        path="/admin/reports"
                                        element={
                                            <AdminRoute>
                                                <AdminReports />
                                            </AdminRoute>
                                        }
                                    />

                                    {/* 404 Not Found */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                                <Footer />
                                <FloatingWhatsApp />
                            </div>
                        </Router>
                    </ErrorBoundary>
                </CartProvider>
            </ToastProvider>
        </AuthProvider >
    );
}

export default App;
