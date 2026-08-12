# India Pay Now

Modern Indian digital payments platform — consumer wallet experience + merchant payment dashboard.

**Stack:** React (Vite) · Tailwind CSS · Node.js · Express · SQLite · JWT

## Quick start

```bash
# Install all dependencies
npm run install:all

# Seed demo data
npm run seed

# Run API + client together
npm run dev
```

- **Frontend:** http://localhost:5173  
- **API:** http://localhost:5001/api  

## Demo accounts

| Role | Email | Mobile | Password |
|------|-------|--------|----------|
| User | harshit@indiapaynow.com | 9876543210 | Password@123 |
| Merchant | merchant@indiapaynow.com | 9123456780 | Password@123 |
| Admin | admin@indiapaynow.com | 9999999999 | Password@123 |

**Demo OTP:** `123456` (used for registration, transfers, and 2FA)

## Features

### Consumer
- Landing page, login/register with OTP
- Wallet balance, add money, send/receive money
- Scan & Pay (mock QR flow)
- Bills & recharges (mobile, DTH, electricity, water, FASTag, etc.)
- Transactions, notifications, profile & security

### Merchant
- Overview with revenue charts
- Payment links + public checkout (`/pay/:slug`)
- Merchant QR (static / amount-based)
- Transactions, refunds, settlements, reports
- Customers, developer API keys & webhooks

### Admin
- Users, merchants, KYC, transactions
- Refunds, settlements, complaints, API logs, settings

## Project structure

```text
india-pay-now/
├── client/          # React + Vite frontend
├── server/          # Express REST API
├── .env.example
└── package.json
```

## Environment

Copy `.env.example` to `server/.env` (already included for local demo).

```env
PORT=5001
JWT_SECRET=india_pay_now_dev_secret_change_in_production
CLIENT_URL=http://localhost:5173
DB_PATH=./data/indiapaynow.db
OTP_DEMO_CODE=123456
```

## Payment architecture

Payments use a **sandbox mock** `PaymentService` (`createPayment`, `verifyPayment`, `refundPayment`, `getPaymentStatus`, `createPaymentLink`) so the full product flow works without real money movement. Swap the service implementation later for a legitimate UPI/payment provider — do not hardcode live credentials.

## Security

- JWT authentication & role-based access (`user` / `merchant` / `admin`)
- bcrypt password hashing
- Rate limiting, Helmet headers, CORS, input validation
- API secrets shown only once on creation
- Audit logs for sensitive actions

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server |
| `npm run seed` | Reset & seed SQLite demo DB |
| `npm run build` | Production build of client |
| `npm start` | Run API only |

## License

Private demo / prototype — for educational and product evaluation use.
