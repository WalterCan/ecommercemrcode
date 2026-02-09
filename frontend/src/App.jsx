import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import ToastContainer from './components/layout/ToastContainer';
import ErrorBoundary from './components/common/ErrorBoundary';
import usePageTitle from './utils/usePageTitle';
import Layout from './components/layout/Layout';

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
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import ClientAppointments from './pages/ClientAppointments';
import ReservarTurno from './pages/ReservarTurno';
import Therapies from './pages/Therapies'; // [NEW] Público
import ConfirmAppointment from './pages/ConfirmAppointment';
import PaymentStatus from './pages/PaymentStatus';
import LandingPage from './pages/LandingPage';
import Contact from './pages/Contact'; // [NEW]

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCategoryForm from './pages/admin/AdminCategoryForm';
import AdminWhatsApp from './pages/admin/WhatsAppConnect';
import AdminSettings from './pages/admin/AdminSettings';
import AdminModulesMarketplace from './pages/admin/AdminModulesMarketplace';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';
import AdminStockAlerts from './pages/admin/AdminStockAlerts';
import AdminReports from './pages/admin/AdminReports';
import AdminPatients from './pages/admin/AdminPatients'; // [NEW]
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminAppointmentHistory from './pages/admin/AdminAppointmentHistory';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminPurchases from './pages/admin/AdminPurchases';
import AdminPurchaseForm from './pages/admin/AdminPurchaseForm';
import AdminPurchaseDetail from './pages/admin/AdminPurchaseDetail';
import AdminTherapies from './pages/admin/AdminTherapies'; // [NEW]
import AdminAvailability from './pages/admin/AdminAvailability'; // [NEW]
import AdminReminders from './pages/admin/AdminReminders'; // [NEW] Recordatorios
import SuperAdminUserManagement from './pages/admin/SuperAdminUserManagement'; // [NEW] Super Admin
import AdminTherapyStats from './pages/admin/AdminTherapyStats'; // [NEW] Therapy Stats
import AdminPatientDetail from './pages/admin/AdminPatientDetail'; // [NEW] Patient Detail
import AdminAudit from './pages/admin/AdminAudit'; // [NEW] Audit Logs

// Components
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import Footer from './components/layout/Footer';
import ModuleRoute from './components/common/ModuleRoute'; // [NEW] Module-based routes
import SuperAdminRoute from './components/common/SuperAdminRoute'; // [NEW] Super Admin routes
import ModuleNotAvailable from './pages/ModuleNotAvailable'; // [NEW] Module not available page

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

    // Si está logueado pero NO es admin ni super_admin, al perfil de cliente
    if (user.role !== 'admin' && user.role !== 'super_admin') return <Navigate to="/perfil" />;

    return children;
};

// Component to handle page title updates
const PageTitleHandler = () => {
    const { settings } = useSettings();
    usePageTitle(settings);
    return null;
};

const HomeSelector = ({ activeModules }) => {
    // Home.jsx ahora maneja internamente el modo de mantenimiento con HomeDevPromo
    // No necesitamos LandingPage aquí
    return <Home />;
};

function App() {
    const [activeModules, setActiveModules] = React.useState([]);
    const [loadingModules, setLoadingModules] = React.useState(true);

    React.useEffect(() => {
        const fetchModules = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const res = await fetch(`${baseUrl}/modules/active`);
                if (res.ok) {
                    const data = await res.json();
                    setActiveModules(data);
                }
            } catch (error) {
                console.error('Error fetching modules in App:', error);
            } finally {
                setLoadingModules(false);
            }
        };
        fetchModules();
    }, []);

    if (loadingModules) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div>
            </div>
        );
    }

    return (
        <AuthProvider>
            <SettingsProvider>
                <ToastProvider>
                    <CartProvider>
                        <ErrorBoundary>
                            <Router>
                                <PageTitleHandler />
                                <div className="App flex flex-col min-h-screen">
                                    <ToastContainer />
                                    <Routes>
                                        {/* Public Routes */}
                                        <Route
                                            path="/"
                                            element={<HomeSelector activeModules={activeModules} />}
                                        />

                                        {/* Rutas Públicas de Web (Siempre activas si el módulo web está activo o por defecto) */}
                                        <Route path="/nosotros" element={<About />} />
                                        <Route path="/terapias" element={<Therapies />} />
                                        <Route path="/terminos" element={<Terminos />} />
                                        <Route path="/privacidad" element={<Privacidad />} />
                                        <Route path="/contacto" element={<Contact />} />

                                        {/* Rutas de E-commerce - Productos públicos */}
                                        <Route path="/productos" element={<Products />} />
                                        <Route path="/product/:id" element={<ProductDetail />} />
                                        <Route path="/checkout" element={
                                            <PrivateRoute>
                                                <Checkout />
                                            </PrivateRoute>
                                        } />
                                        <Route path="/order-confirmation/:orderId" element={
                                            <PrivateRoute>
                                                <OrderConfirmation />
                                            </PrivateRoute>
                                        } />
                                        <Route path="/payment/status" element={<PaymentStatus />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/registro" element={<Register />} />
                                        <Route path="/forgot-password" element={<ForgotPassword />} />
                                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                                        <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
                                        <Route path="/terminos" element={<Terminos />} />
                                        <Route path="/privacidad" element={<Privacidad />} />

                                        {/* Module-Protected Routes - Appointments */}
                                        <Route
                                            path="/mis-turnos"
                                            element={
                                                <PrivateRoute>
                                                    <ModuleRoute moduleCode="appointments" moduleName="Sistema de Turnos">
                                                        <ClientAppointments />
                                                    </ModuleRoute>
                                                </PrivateRoute>
                                            }
                                        />
                                        <Route
                                            path="/reservar-turno"
                                            element={
                                                <PrivateRoute>
                                                    <ModuleRoute moduleCode="appointments" moduleName="Sistema de Turnos">
                                                        <ReservarTurno />
                                                    </ModuleRoute>
                                                </PrivateRoute>
                                            }
                                        />

                                        {/* Module Not Available Page */}
                                        <Route path="/modulo-no-disponible" element={<ModuleNotAvailable />} />

                                        {/* Admin Protected Routes */}
                                        <Route
                                            path="/turnos/confirmar/:id"
                                            element={<ConfirmAppointment />}
                                        />
                                        <Route path="/turnos/pago/exito" element={<PaymentStatus />} />
                                        <Route path="/turnos/pago/fallo" element={<PaymentStatus />} />
                                        <Route path="/turnos/pago/pendiente" element={<PaymentStatus />} />

                                        {/* Rutas de Admin Protegidas */}
                                        <Route
                                            path="/admin"
                                            element={
                                                <AdminRoute>
                                                    <AdminDashboard />
                                                </AdminRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin/apps"
                                            element={
                                                <AdminRoute>
                                                    <AdminModulesMarketplace />
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
                                            path="/admin/agenda"
                                            element={
                                                <AdminRoute>
                                                    <AdminCalendar />
                                                </AdminRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin/turnos/historial"
                                            element={
                                                <AdminRoute>
                                                    <AdminAppointmentHistory />
                                                </AdminRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin/recordatorios"
                                            element={
                                                <AdminRoute>
                                                    <AdminReminders />
                                                </AdminRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin/pacientes"
                                            element={
                                                <AdminRoute>
                                                    <AdminPatients />
                                                </AdminRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin/pacientes/ingresos"
                                            element={
                                                <AdminRoute>
                                                    <AdminTherapyStats />
                                                </AdminRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin/pacientes/:id"
                                            element={
                                                <AdminRoute>
                                                    <AdminPatientDetail />
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
                                                    <ModuleRoute moduleCode="settings" moduleName="Ajustes del Sitio">
                                                        <AdminSettings />
                                                    </ModuleRoute>
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
                                        {/* Módulo de Compras (Inventory) */}
                                        <Route
                                            path="/admin/suppliers"
                                            element={
                                                <AdminRoute>
                                                    <ModuleRoute moduleCode="purchases" moduleName="Gestión de Compras">
                                                        <AdminSuppliers />
                                                    </ModuleRoute>
                                                </AdminRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin/purchases"
                                            element={
                                                <AdminRoute>
                                                    <ModuleRoute moduleCode="purchases" moduleName="Gestión de Compras">
                                                        <AdminPurchases />
                                                    </ModuleRoute>
                                                </AdminRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin/purchases/new"
                                            element={
                                                <AdminRoute>
                                                    <ModuleRoute moduleCode="purchases" moduleName="Gestión de Compras">
                                                        <AdminPurchaseForm />
                                                    </ModuleRoute>
                                                </AdminRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin/purchases/:id"
                                            element={
                                                <AdminRoute>
                                                    <ModuleRoute moduleCode="purchases" moduleName="Gestión de Compras">
                                                        <AdminPurchaseDetail />
                                                    </ModuleRoute>
                                                </AdminRoute>
                                            }
                                        />

                                        <Route
                                            path="/admin/therapies"
                                            element={
                                                <AdminRoute>
                                                    <AdminTherapies />
                                                </AdminRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin/availability"
                                            element={
                                                <AdminRoute>
                                                    <AdminAvailability />
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

                                        {/* Super Admin Routes */}
                                        <Route
                                            path="/super-admin/users"
                                            element={
                                                <SuperAdminRoute>
                                                    <SuperAdminUserManagement />
                                                </SuperAdminRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin/audit"
                                            element={
                                                <SuperAdminRoute>
                                                    <AdminAudit />
                                                </SuperAdminRoute>
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
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;
