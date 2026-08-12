import AdminResource from './_AdminResource';
export default function Merchants() {
  return <AdminResource title="Merchants" subtitle="Review all registered businesses" endpoint="/admin/merchants" keys={['merchants']} columns={[{ label: 'Business', keys: ['businessName', 'name'] }, { label: 'Owner', keys: ['owner.fullName', 'ownerName'] }, { label: 'Email', keys: ['email', 'owner.email'] }, { label: 'Merchant ID', keys: ['merchantId', 'id'] }, { label: 'KYC', keys: ['kycStatus', 'kyc.status'], type: 'status' }, { label: 'Status', key: 'status', type: 'status' }, { label: 'Joined', keys: ['createdAt', 'created_at'], type: 'date' }]} />;
}
