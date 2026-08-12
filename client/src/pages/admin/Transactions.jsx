import AdminResource from './_AdminResource';
export default function Transactions() {
  return <AdminResource title="Transactions" subtitle="All payments across the platform" endpoint="/admin/transactions" keys={['transactions']} columns={[{ label: 'ID', keys: ['transactionId', 'id'] }, { label: 'Date', keys: ['createdAt', 'created_at'], type: 'date' }, { label: 'Merchant', keys: ['merchant.businessName', 'merchantName'] }, { label: 'Customer', keys: ['customer.name', 'customerName'] }, { label: 'Amount', key: 'amount', type: 'money' }, { label: 'Method', keys: ['paymentMethod', 'method'] }, { label: 'Status', key: 'status', type: 'status' }]} />;
}
