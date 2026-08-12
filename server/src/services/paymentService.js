import { generateId } from '../utils/helpers.js';
import db from '../db/database.js';

class PaymentService {
  createPayment({ amount, paymentMethod = 'upi', metadata = {} }) {
    const id = generateId('pay');
    const providerRef = `MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const status = Math.random() > 0.05 ? 'success' : 'failed';

    db.prepare(
      `INSERT INTO payments (id, amount, status, payment_method, provider_ref, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, amount, status === 'success' ? 'captured' : 'failed', paymentMethod, providerRef, JSON.stringify(metadata));

    return {
      id,
      providerRef,
      amount,
      status,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };
  }

  verifyPayment(paymentId) {
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
    if (!payment) return null;
    return {
      id: payment.id,
      status: payment.status === 'captured' ? 'success' : payment.status,
      amount: payment.amount,
      providerRef: payment.provider_ref,
    };
  }

  refundPayment(paymentId, amount) {
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'captured') throw new Error('Payment not refundable');
    if (amount > payment.amount) throw new Error('Refund amount exceeds payment');

    const refundId = generateId('rfnd');
    db.prepare(`UPDATE payments SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(
      amount >= payment.amount ? 'refunded' : 'partially_refunded',
      paymentId
    );

    return {
      id: refundId,
      paymentId,
      amount,
      status: 'processing',
      estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  getPaymentStatus(paymentId) {
    return this.verifyPayment(paymentId);
  }

  createPaymentLink({ amount, description, customer }) {
    return {
      id: generateId('plink'),
      amount,
      description,
      customer,
      url: null,
      status: 'active',
    };
  }
}

export default new PaymentService();
