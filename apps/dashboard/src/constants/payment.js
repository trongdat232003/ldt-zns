// Payment method constants
export const PAYMENT_METHODS = {
  TRANSFER: 'Transfer',
  CASH: 'Cash',
  CARD: 'Card',
  VOUCHER: 'Voucher',
};

// Payment method labels (Vietnamese)
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.TRANSFER]: 'Chuyển khoản',
  [PAYMENT_METHODS.CASH]: 'Tiền mặt',
  [PAYMENT_METHODS.CARD]: 'Thẻ',
  [PAYMENT_METHODS.VOUCHER]: 'Phiếu quà tặng',
};

/**
 * Get Vietnamese label for payment method
 * @param {string} method - Payment method from API (Transfer, Cash, Card, Voucher)
 * @returns {string} - Vietnamese label or original method if not found
 */
export function getPaymentMethodLabel(method) {
  return PAYMENT_METHOD_LABELS[method] || method;
}
