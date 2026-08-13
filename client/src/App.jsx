import { Navigate, Outlet, Route, Routes, useSearchParams } from 'react-router-dom';
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
import { marketingPagePaths } from './data/marketingPages';
import { destinationForLogin, normalizeAccountIntent } from './utils/authRouting';

function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
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
  const [searchParams] = useSearchParams();
  if (loading) return null;
  const switching = searchParams.get('switch') === '1';
  if (user && !switching) {
    const intent = normalizeAccountIntent(searchParams.get('type') || searchParams.get('account'));
    return (
      <Navigate
        to={destinationForLogin(user, intent, searchParams.get('redirect'))}
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
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#0b1f3a',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pay/:slug" element={<PublicPay />} />
        {marketingPagePaths.map((path) => (
          <Route key={path} path={path} element={<MarketingPage />} />
        ))}

        <Route element={<PublicOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
            <Route path="settlements" element={<Settlements />} />
            <Route path="refunds" element={<BusinessRefunds />} />
            <Route path="reports" element={<Reports />} />
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
