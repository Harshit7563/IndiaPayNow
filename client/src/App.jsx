import { Navigate, Outlet, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { AppLayout, BusinessLayout, AdminLayout } from './layouts/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PublicPay from './pages/PublicPay';
import Dashboard from './pages/app/Dashboard';
import SendMoney from './pages/app/SendMoney';
import ReceiveMoney from './pages/app/ReceiveMoney';
import ScanPay from './pages/app/ScanPay';
import AddMoney from './pages/app/AddMoney';
import Payments from './pages/app/Payments';
import Bills from './pages/app/Bills';
import Transactions from './pages/app/Transactions';
import Profile from './pages/app/Profile';
import Autopay from './pages/app/Autopay';
import Rewards from './pages/app/Rewards';
import Support from './pages/app/Support';
import Kyc from './pages/app/Kyc';
import UpiPin from './pages/app/UpiPin';
import MerchantHub from './pages/app/MerchantHub';
import BusinessOverview from './pages/business/Overview';
import BusinessPayments from './pages/business/Payments';
import BusinessTransactions from './pages/business/Transactions';
import BusinessCustomers from './pages/business/Customers';
import PaymentLinks from './pages/business/PaymentLinks';
import MerchantQR from './pages/business/MerchantQR';
import CashPoint from './pages/business/CashPoint';
import Settlements from './pages/business/Settlements';
import BusinessRefunds from './pages/business/Refunds';
import Reports from './pages/business/Reports';
import Developers from './pages/business/DeveloperConsole';
import BusinessSettings from './pages/business/Settings';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminMerchants from './pages/admin/Merchants';
import AdminTransactions from './pages/admin/Transactions';
import AdminRefunds from './pages/admin/Refunds';
import AdminSettlements from './pages/admin/Settlements';
import AdminKYC from './pages/admin/KYC';
import AdminComplaints from './pages/admin/Complaints';
import AdminApiLogs from './pages/admin/ApiLogs';
import AdminSettings from './pages/admin/Settings';
import MarketingPage from './pages/MarketingPage';
import TrustAndSafety from './pages/TrustAndSafety';
import ForBusiness from './pages/ForBusiness';
import BusinessOnboarding from './pages/BusinessOnboarding';
import VerificationSuite from './pages/VerificationSuite';
import VerificationCategories from './pages/VerificationCategories';
import VerificationServices from './pages/VerificationServices';
import VerificationServiceDetail from './pages/VerificationServiceDetail';
import CatalogServiceDetail from './pages/CatalogServiceDetail';
import { marketingPagePaths } from './data/marketingPages';
import { destinationForLogin, normalizeAccountIntent } from './utils/authRouting';

function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    );
  }
  if (!user) {
    const to = location.pathname.startsWith('/business') ? '/login?type=business' : '/login';
    return <Navigate to={to} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    // Personal accounts opening /business go to merchant activation, not a random bounce
    if (roles.includes('merchant') && user.role === 'user') {
      return <Navigate to="/app/merchant" replace />;
    }
    return <Navigate to={destinationForLogin(user)} replace />;
  }
  return <Outlet />;
}

function PublicOnly() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  if (loading) return null;
  const switching = searchParams.get('switch') === '1';
  if (user && !switching) {
    const fromQuery = normalizeAccountIntent(searchParams.get('type') || searchParams.get('account'));
    const fromPath = location.pathname.startsWith('/for-business')
      ? 'business'
      : location.pathname.startsWith('/login') || location.pathname.startsWith('/register')
        ? 'personal'
        : null;
    return (
      <Navigate
        to={destinationForLogin(user, fromQuery || fromPath, searchParams.get('redirect'))}
        replace
      />
    );
  }
  return <Outlet />;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ top: 16 }}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '16px',
            background: '#fff',
            color: '#111',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
            border: '1px solid rgba(226, 232, 240, 0.95)',
            padding: '12px 14px',
            maxWidth: '22rem',
          },
          success: {
            iconTheme: { primary: '#00baf2', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: {
              borderColor: 'rgba(254, 202, 202, 0.9)',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/trust-and-safety" element={<TrustAndSafety />} />
        <Route path="/for-business" element={<ForBusiness />} />
        <Route path="/verification" element={<VerificationSuite />} />
        <Route path="/verification/categories" element={<VerificationCategories />} />
        <Route path="/verification/services/:serviceId" element={<VerificationServiceDetail />} />
        <Route path="/verification/services" element={<VerificationServices />} />
        <Route path="/services/:slug" element={<CatalogServiceDetail />} />
        <Route path="/pay/:slug" element={<PublicPay />} />
        {marketingPagePaths.map((path) => (
          <Route key={path} path={path} element={<MarketingPage />} />
        ))}

        <Route element={<PublicOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/for-business/open-account" element={<BusinessOnboarding />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="send" element={<SendMoney />} />
            <Route path="receive" element={<ReceiveMoney />} />
            <Route path="scan" element={<ScanPay />} />
            <Route path="add-money" element={<AddMoney />} />
            <Route path="payments" element={<Payments />} />
            <Route path="bills/:service" element={<Bills />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="profile" element={<Profile />} />
            <Route path="autopay" element={<Autopay />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="support" element={<Support />} />
            <Route path="kyc" element={<Kyc />} />
            <Route path="upi-pin" element={<UpiPin />} />
            <Route path="merchant" element={<MerchantHub />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['merchant', 'admin']} />}>
          <Route path="/business" element={<BusinessLayout />}>
            <Route index element={<BusinessOverview />} />
            <Route path="payments" element={<BusinessPayments />} />
            <Route path="transactions" element={<BusinessTransactions />} />
            <Route path="customers" element={<BusinessCustomers />} />
            <Route path="payment-links" element={<PaymentLinks />} />
            <Route path="qr" element={<MerchantQR />} />
            <Route path="cashpoint" element={<CashPoint />} />
            <Route path="settlements" element={<Settlements />} />
            <Route path="refunds" element={<BusinessRefunds />} />
            <Route path="reports" element={<Reports />} />
            <Route path="kyc" element={<Kyc />} />
            <Route path="developers" element={<Developers />} />
            <Route path="settings" element={<BusinessSettings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="merchants" element={<AdminMerchants />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="refunds" element={<AdminRefunds />} />
            <Route path="settlements" element={<AdminSettlements />} />
            <Route path="kyc" element={<AdminKYC />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="api-logs" element={<AdminApiLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
