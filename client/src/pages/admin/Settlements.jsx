import AdminResource from './_AdminResource';
export default function Settlements() {
  return <AdminResource title="Settlements" subtitle="Track merchant bank payouts" endpoint="/admin/settlements" keys={['settlements']} columns={[{ label: 'ID', keys: ['settlementId', 'id'] }, { label: 'Merchant', keys: ['merchant.businessName', 'merchantName'] }, { label: 'Amount', key: 'amount', type: 'money' }, { label: 'Bank / UTR', keys: ['utr', 'reference', 'bankAccount'] }, { label: 'Requested', keys: ['createdAt', 'created_at'], type: 'date' }, { label: 'Settled', keys: ['settledAt', 'settled_at'], type: 'date' }, { label: 'Status', key: 'status', type: 'status' }]} />;
}
