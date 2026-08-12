import AdminResource from './_AdminResource';
export default function ApiLogs() {
  return <AdminResource title="API logs" subtitle="Inspect developer API activity" endpoint="/admin/api-logs" keys={['logs', 'apiLogs']} columns={[{ label: 'Time', keys: ['createdAt', 'created_at'], type: 'date' }, { label: 'Merchant', keys: ['merchant.businessName', 'merchantName'] }, { label: 'Method', key: 'method' }, { label: 'Endpoint', keys: ['endpoint', 'path'] }, { label: 'Status', keys: ['statusCode', 'status'], type: 'status' }, { label: 'Duration', keys: ['duration', 'responseTime'] }, { label: 'IP', keys: ['ip', 'ipAddress'] }]} />;
}
