// Invoice status constants
export const INVOICE_STATUS = {
  COMPLETED: 1,
  PROCESSING: 2,
  CANCELLED: 3,
};

// Invoice status labels and colors
export const INVOICE_STATUS_CONFIG = {
  [INVOICE_STATUS.COMPLETED]: {
    label: 'Hoàn thành',
    color: 'success',
  },
  [INVOICE_STATUS.PROCESSING]: {
    label: 'Đang xử lý',
    color: 'warning',
  },
  [INVOICE_STATUS.CANCELLED]: {
    label: 'Đã hủy',
    color: 'danger',
  },
};

/**
 * Get status config for invoice
 * @param {number} status - Invoice status (1: Completed, 2: Processing, 3: Cancelled)
 * @returns {object} - Status config with label and color
 */
export function getInvoiceStatusConfig(status) {
  return INVOICE_STATUS_CONFIG[status] || {
    label: `Trạng thái ${status}`,
    color: 'default',
  };
}
