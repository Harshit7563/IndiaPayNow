/** India Pay Now — Merchant Developer API catalog */

export const WEBHOOK_EVENTS = [
  {
    id: 'payment.success',
    label: 'payment.success',
    description: 'Fired when a payment is captured successfully.',
    sample: {
      event: 'payment.success',
      created_at: '2026-08-13T09:30:00Z',
      data: {
        id: 'pay_9f2a1c',
        amount: 49900,
        currency: 'INR',
        status: 'success',
        method: 'upi',
      },
    },
  },
  {
    id: 'payment.failed',
    label: 'payment.failed',
    description: 'Fired when a payment attempt fails or is declined.',
    sample: {
      event: 'payment.failed',
      created_at: '2026-08-13T09:31:00Z',
      data: {
        id: 'pay_9f2a1d',
        amount: 49900,
        currency: 'INR',
        status: 'failed',
        error_code: 'UPI_DECLINED',
      },
    },
  },
  {
    id: 'refund.processed',
    label: 'refund.processed',
    description: 'Fired when a refund is completed.',
    sample: {
      event: 'refund.processed',
      created_at: '2026-08-13T10:00:00Z',
      data: {
        id: 'rfnd_77ab',
        payment_id: 'pay_9f2a1c',
        amount: 49900,
        status: 'processed',
      },
    },
  },
  {
    id: 'settlement.paid',
    label: 'settlement.paid',
    description: 'Fired when settlement is credited to your bank account.',
    sample: {
      event: 'settlement.paid',
      created_at: '2026-08-14T06:00:00Z',
      data: {
        id: 'stl_4412',
        amount: 1250000,
        utr: 'IPN20260814001',
        status: 'paid',
      },
    },
  },
];

export const developerApiCatalog = [
  {
    id: 'auth',
    label: 'Auth & Keys',
    description: 'Authenticate requests with Bearer JWT or merchant API keys.',
    subcategories: [
      {
        id: 'auth-keys',
        label: 'API Keys',
        apis: [
          {
            id: 'list-api-keys',
            name: 'List API keys',
            method: 'GET',
            path: '/developer/api-keys',
            summary: 'Return all test/live API keys for your merchant account.',
            auth: 'Bearer',
            callable: true,
            query: [{ name: 'mode', type: 'string', required: false, description: 'test | live' }],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: [
                {
                  id: 'key_01',
                  name: 'Checkout prod',
                  key_prefix: 'ipn_live_ab12',
                  mode: 'live',
                  is_active: 1,
                },
              ],
            },
          },
          {
            id: 'create-api-key',
            name: 'Create API key',
            method: 'POST',
            path: '/developer/api-keys',
            summary: 'Generate a new API key. Secret is shown only once.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: [
              { name: 'name', type: 'string', required: true, description: 'Friendly key name' },
              { name: 'mode', type: 'string', required: false, description: 'test (default) | live' },
            ],
            sampleRequest: { name: 'Storefront checkout', mode: 'test' },
            sampleResponse: {
              success: true,
              data: {
                id: 'key_02',
                key: 'ipn_test_••••',
                secret: '••••••••',
                mode: 'test',
                warning: 'Store the secret securely. It will not be shown again.',
              },
            },
          },
          {
            id: 'revoke-api-key',
            name: 'Revoke API key',
            method: 'DELETE',
            path: '/developer/api-keys/:id',
            summary: 'Deactivate an API key immediately.',
            auth: 'Bearer',
            callable: true,
            pathParams: [{ name: 'id', type: 'string', required: true, description: 'API key id' }],
            query: [],
            body: null,
            sampleRequest: null,
            sampleResponse: { success: true, message: 'API key revoked' },
          },
          {
            id: 'regenerate-secret',
            name: 'Regenerate secret',
            method: 'POST',
            path: '/developer/api-keys/:id/regenerate',
            summary: 'Rotate the secret for an existing key.',
            auth: 'Bearer',
            callable: true,
            pathParams: [{ name: 'id', type: 'string', required: true, description: 'API key id' }],
            query: [],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: { id: 'key_02', secret: '••••••••' },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    description: 'Create, fetch, and refund merchant payments.',
    subcategories: [
      {
        id: 'payments-core',
        label: 'Create & Status',
        apis: [
          {
            id: 'create-payment',
            name: 'Create payment',
            method: 'POST',
            path: '/payments/create',
            summary: 'Create a payment order for UPI, card, netbanking, or wallet.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: [
              { name: 'amount', type: 'number', required: true, description: 'Amount in INR (rupees)' },
              { name: 'customerName', type: 'string', required: false, description: 'Payer name' },
              { name: 'customerMobile', type: 'string', required: false, description: '10-digit mobile' },
              { name: 'method', type: 'string', required: false, description: 'upi | card | netbanking | wallet' },
              { name: 'note', type: 'string', required: false, description: 'Order note / description' },
            ],
            sampleRequest: {
              amount: 499,
              customerName: 'Riya Sharma',
              customerMobile: '9876543210',
              method: 'upi',
              note: 'Order #1042',
            },
            sampleResponse: {
              success: true,
              data: {
                id: 'pay_9f2a1c',
                amount: 499,
                status: 'pending',
                payment_method: 'upi',
              },
            },
          },
          {
            id: 'get-payment',
            name: 'Get payment',
            method: 'GET',
            path: '/payments/:id',
            summary: 'Fetch payment status and metadata by id.',
            auth: 'Bearer',
            callable: true,
            pathParams: [{ name: 'id', type: 'string', required: true, description: 'Payment / transaction id' }],
            query: [],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: {
                id: 'pay_9f2a1c',
                amount: 499,
                status: 'success',
                payment_method: 'upi',
              },
            },
          },
          {
            id: 'list-transactions',
            name: 'List transactions',
            method: 'GET',
            path: '/transactions',
            summary: 'Paginated transaction history for the authenticated merchant.',
            auth: 'Bearer',
            callable: true,
            query: [
              { name: 'limit', type: 'number', required: false, description: 'Page size (default 20)' },
              { name: 'status', type: 'string', required: false, description: 'Filter by status' },
            ],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: [{ id: 'txn_01', amount: 499, status: 'success', type: 'payment' }],
            },
          },
        ],
      },
      {
        id: 'payments-refunds',
        label: 'Refunds',
        apis: [
          {
            id: 'create-refund',
            name: 'Create refund',
            method: 'POST',
            path: '/payments/:id/refund',
            summary: 'Refund a successful payment fully or partially.',
            auth: 'Bearer',
            callable: true,
            pathParams: [{ name: 'id', type: 'string', required: true, description: 'Original payment id' }],
            query: [],
            body: [
              { name: 'amount', type: 'number', required: false, description: 'Partial refund amount in INR' },
              { name: 'reason', type: 'string', required: false, description: 'Customer-facing reason' },
            ],
            sampleRequest: { amount: 499, reason: 'Customer cancelled' },
            sampleResponse: {
              success: true,
              data: { id: 'rfnd_77ab', status: 'processed', amount: 499 },
            },
          },
          {
            id: 'list-refunds',
            name: 'List refunds',
            method: 'GET',
            path: '/refunds',
            summary: 'List all refunds for your merchant account.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: [{ id: 'rfnd_77ab', amount: 499, status: 'processed' }],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'payment-links',
    label: 'Payment Links',
    description: 'Shareable links for remote collections.',
    subcategories: [
      {
        id: 'links-manage',
        label: 'Manage Links',
        apis: [
          {
            id: 'create-payment-link',
            name: 'Create payment link',
            method: 'POST',
            path: '/payment-links',
            summary: 'Create a hosted payment link customers can open and pay.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: [
              { name: 'amount', type: 'number', required: true, description: 'Amount in INR' },
              { name: 'description', type: 'string', required: false, description: 'Shown on checkout' },
              { name: 'customerName', type: 'string', required: false, description: 'Optional prefill' },
            ],
            sampleRequest: {
              amount: 1500,
              description: 'Invoice INV-204',
              customerName: 'Aarav Mehta',
            },
            sampleResponse: {
              success: true,
              data: {
                id: 'plink_88',
                slug: 'inv-204',
                amount: 1500,
                url: 'https://indiapaynow.in/pay/inv-204',
              },
            },
          },
          {
            id: 'list-payment-links',
            name: 'List payment links',
            method: 'GET',
            path: '/payment-links',
            summary: 'List active and disabled payment links.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: [{ id: 'plink_88', amount: 1500, status: 'active' }],
            },
          },
          {
            id: 'disable-payment-link',
            name: 'Disable payment link',
            method: 'DELETE',
            path: '/payment-links/:id',
            summary: 'Disable a payment link so it can no longer accept payments.',
            auth: 'Bearer',
            callable: true,
            pathParams: [{ name: 'id', type: 'string', required: true, description: 'Payment link id' }],
            query: [],
            body: null,
            sampleRequest: null,
            sampleResponse: { success: true, message: 'Payment link disabled' },
          },
        ],
      },
    ],
  },
  {
    id: 'qr',
    label: 'QR Payments',
    description: 'Static and dynamic UPI QR for in-store collections.',
    subcategories: [
      {
        id: 'qr-codes',
        label: 'Merchant QR',
        apis: [
          {
            id: 'create-merchant-qr',
            name: 'Create merchant QR',
            method: 'POST',
            path: '/merchant/qr',
            summary: 'Generate a static or amount-locked dynamic UPI QR.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: [
              { name: 'label', type: 'string', required: false, description: 'Counter / store label' },
              { name: 'amount', type: 'number', required: false, description: 'Fixed amount (dynamic QR)' },
            ],
            sampleRequest: { label: 'Counter 1', amount: 250 },
            sampleResponse: {
              success: true,
              data: {
                id: 'qr_12',
                payload: 'upi://pay?pa=shop@indpaynow&pn=Shop&am=250&cu=INR',
              },
            },
          },
          {
            id: 'list-merchant-qr',
            name: 'List merchant QR',
            method: 'GET',
            path: '/merchant/qr',
            summary: 'List all QR codes created for your business.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: { qrCodes: [{ id: 'qr_12', label: 'Counter 1' }] },
            },
          },
        ],
      },
      {
        id: 'upi-collect',
        label: 'UPI Intent / Collect',
        apis: [
          {
            id: 'upi-collect-doc',
            name: 'UPI collect (intent)',
            method: 'POST',
            path: '/payments/create',
            summary:
              'Create a UPI collect/intent payment. Pass method=upi to trigger collect flow on supported clients.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: [
              { name: 'amount', type: 'number', required: true, description: 'Amount in INR' },
              { name: 'method', type: 'string', required: true, description: 'Must be upi' },
              { name: 'vpa', type: 'string', required: false, description: 'Customer VPA for collect' },
              { name: 'note', type: 'string', required: false, description: 'Collect note' },
            ],
            sampleRequest: {
              amount: 99,
              method: 'upi',
              vpa: 'customer@oksbi',
              note: 'Soundbox collect',
            },
            sampleResponse: {
              success: true,
              data: { id: 'pay_upi_01', status: 'pending', payment_method: 'upi' },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'settlements',
    label: 'Settlements',
    description: 'Bank payouts and reconciliation.',
    subcategories: [
      {
        id: 'settlements-core',
        label: 'Request & History',
        apis: [
          {
            id: 'list-settlements',
            name: 'List settlements',
            method: 'GET',
            path: '/settlements',
            summary: 'Settlement history with UTR and status.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: [{ id: 'stl_4412', amount: 12500, status: 'paid', utr: 'IPN20260814001' }],
            },
          },
          {
            id: 'request-settlement',
            name: 'Request settlement',
            method: 'POST',
            path: '/settlements/request',
            summary: 'Request payout of available settlement balance to your bank.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: [
              { name: 'amount', type: 'number', required: false, description: 'Partial amount; omit for full' },
            ],
            sampleRequest: { amount: 5000 },
            sampleResponse: {
              success: true,
              data: { id: 'stl_4413', amount: 5000, status: 'processing' },
            },
          },
        ],
      },
      {
        id: 'settlements-split',
        label: 'Split Settlement',
        apis: [
          {
            id: 'split-settlement-doc',
            name: 'Split settlement (beta)',
            method: 'POST',
            path: '/settlements/request',
            summary:
              'Request settlement with optional split notes for marketplace / sub-merchant flows (beta — use notes field).',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: [
              { name: 'amount', type: 'number', required: true, description: 'Total settlement amount' },
              {
                name: 'splits',
                type: 'array',
                required: false,
                description: '[{ account, amount, label }] for bookkeeping',
              },
            ],
            sampleRequest: {
              amount: 10000,
              splits: [
                { account: 'primary', amount: 8500, label: 'Platform' },
                { account: 'partner', amount: 1500, label: 'Partner share' },
              ],
            },
            sampleResponse: {
              success: true,
              data: { id: 'stl_split_01', amount: 10000, status: 'processing' },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    description: 'Customer profiles linked to your collections.',
    subcategories: [
      {
        id: 'customers-list',
        label: 'Directory',
        apis: [
          {
            id: 'list-customers',
            name: 'List customers',
            method: 'GET',
            path: '/merchant/customers',
            summary: 'Customers who have paid you via links, QR, or gateway.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: [{ name: 'Riya Sharma', mobile: '9876543210', totalPaid: 2499 }],
            },
          },
          {
            id: 'merchant-overview',
            name: 'Merchant overview',
            method: 'GET',
            path: '/merchant/overview',
            summary: 'Dashboard stats: collection, settlement, refunds.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: {
                stats: { totalCollection: 125000, availableSettlement: 18000 },
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Reconciliation-ready payment reports.',
    subcategories: [
      {
        id: 'reports-summary',
        label: 'Summary',
        apis: [
          {
            id: 'get-reports',
            name: 'Get reports',
            method: 'GET',
            path: '/reports',
            summary: 'Aggregate payment, refund, and settlement report slices.',
            auth: 'Bearer',
            callable: true,
            query: [
              { name: 'from', type: 'string', required: false, description: 'ISO date start' },
              { name: 'to', type: 'string', required: false, description: 'ISO date end' },
            ],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: {
                payments: { count: 120, volume: 245000 },
                refunds: { count: 4, volume: 3200 },
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    description: 'Realtime event delivery to your servers.',
    subcategories: [
      {
        id: 'webhooks-manage',
        label: 'Register',
        apis: [
          {
            id: 'list-webhooks',
            name: 'List webhooks',
            method: 'GET',
            path: '/developer/webhooks',
            summary: 'List registered webhook endpoints.',
            auth: 'Bearer',
            callable: true,
            query: [{ name: 'mode', type: 'string', required: false, description: 'test | live' }],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: [{ id: 'wh_01', url: 'https://example.com/hooks/ipn', status: 'active' }],
            },
          },
          {
            id: 'create-webhook',
            name: 'Create webhook',
            method: 'POST',
            path: '/developer/webhooks',
            summary: 'Register a HTTPS endpoint to receive payment events.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: [
              { name: 'url', type: 'string', required: true, description: 'HTTPS webhook URL' },
              { name: 'mode', type: 'string', required: false, description: 'test | live' },
            ],
            sampleRequest: { url: 'https://example.com/hooks/ipn', mode: 'test' },
            sampleResponse: {
              success: true,
              data: { id: 'wh_02', url: 'https://example.com/hooks/ipn', status: 'active' },
            },
          },
        ],
      },
      {
        id: 'webhooks-events',
        label: 'Events',
        apis: [
          {
            id: 'webhook-events',
            name: 'Event catalog',
            method: 'GET',
            path: '/developer/docs',
            summary: 'Reference of webhook event types and payloads your endpoint will receive.',
            auth: 'Bearer',
            callable: true,
            query: [],
            body: null,
            sampleRequest: null,
            sampleResponse: {
              success: true,
              data: {
                events: WEBHOOK_EVENTS.map((e) => e.id),
              },
            },
            events: WEBHOOK_EVENTS,
          },
        ],
      },
    ],
  },
];

export function flattenApis(catalog = developerApiCatalog) {
  const list = [];
  for (const category of catalog) {
    for (const sub of category.subcategories) {
      for (const api of sub.apis) {
        list.push({ ...api, categoryId: category.id, categoryLabel: category.label, subcategoryId: sub.id, subcategoryLabel: sub.label });
      }
    }
  }
  return list;
}

export function findApiById(id, catalog = developerApiCatalog) {
  return flattenApis(catalog).find((api) => api.id === id) || null;
}

export function buildCurl({ method, path, body, baseUrl = 'https://api.indiapaynow.in/api', token = 'YOUR_TOKEN' }) {
  const url = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const lines = [`curl -X ${method} '${url}'`, `  -H 'Authorization: Bearer ${token}'`, `  -H 'Content-Type: application/json'`];
  if (body && method !== 'GET' && method !== 'DELETE') {
    lines.push(`  -d '${JSON.stringify(body)}'`);
  }
  return lines.join(' \\\n');
}
