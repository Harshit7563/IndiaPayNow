import AdminResource from './_AdminResource';
export default function Refunds() {
  return <AdminResource title="Refunds" subtitle="Monitor refunds across all merchants" endpoint="/admin/refunds" keys={['refunds']} columns={[{ label: 'Refund ID', keys: ['refundId', 'id'] }, { label: 'Transaction', keys: ['transactionId', 'transaction.id'] }, { label: 'Merchant', keys: ['merchant.businessName', 'merchantName'] }, { label: 'Amount', key: 'amount', type: 'money' }, { label: 'Reason', key: 'reason' }, { label: 'Requested', keys: ['createdAt', 'created_at'], type: 'date' }, { label: 'Status', key: 'status', type: 'status' }]} />;
}
