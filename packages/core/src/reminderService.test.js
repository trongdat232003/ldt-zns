import test from 'node:test';
import assert from 'node:assert';
import { isOilInvoice, buildReminderFromInvoice, isDueToday } from './reminderService.js';

test('isOilInvoice should return true if invoice contains oil products', () => {
  const invoice = {
    invoiceDetails: [{ productId: 1 }, { productId: 2 }]
  };
  const oilSet = new Set([2, 3]);
  assert.strictEqual(isOilInvoice(invoice, oilSet), true);
});

test('isOilInvoice should return false if invoice contains no oil products', () => {
  const invoice = {
    invoiceDetails: [{ productId: 1 }]
  };
  const oilSet = new Set([2, 3]);
  assert.strictEqual(isOilInvoice(invoice, oilSet), false);
});

test('buildReminderFromInvoice should correctly calculate due date (+30 days)', () => {
  const invoice = {
    code: 'INV01',
    id: 101,
    customerId: 999,
    customerCode: 'CUS01',
    customerName: 'Nguyen Van A',
    purchaseDate: '2026-07-01T10:00:00Z',
    total: 500000,
    invoiceDetails: [{ productName: 'Oil A', quantity: 1 }]
  };
  const reminder = buildReminderFromInvoice(invoice, '0901234567');
  
  assert.strictEqual(reminder.due_date, '2026-07-31');
  assert.strictEqual(reminder.phone, '0901234567');
  assert.strictEqual(reminder.products.length, 1);
});

test('isDueToday should return true for pending reminders due today', () => {
  const reminder = { due_date: '2026-07-31', sent: false };
  assert.strictEqual(isDueToday(reminder, '2026-07-31'), true);
});
