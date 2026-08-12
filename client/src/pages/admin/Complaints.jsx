import AdminResource from './_AdminResource';
export default function Complaints() {
  return <AdminResource title="Complaints" subtitle="Customer and merchant support cases" endpoint="/admin/complaints" keys={['complaints']} columns={[{ label: 'Ticket', keys: ['ticketId', 'id'] }, { label: 'Raised by', keys: ['user.fullName', 'userName', 'name'] }, { label: 'Subject', key: 'subject' }, { label: 'Category', key: 'category' }, { label: 'Priority', key: 'priority', type: 'status' }, { label: 'Created', keys: ['createdAt', 'created_at'], type: 'date' }, { label: 'Status', key: 'status', type: 'status' }]} />;
}
