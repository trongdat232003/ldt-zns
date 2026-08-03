import { apiRequest } from '../lib/apiClient';

/**
 * Get invoice detail by invoice code from KiotViet
 * @param {string} invoiceCode - Invoice code
 * @returns {Promise<object>} Invoice data
 * @throws {Error} When API request fails
 */
export async function getInvoiceByCode(invoiceCode) {
  if (!invoiceCode) {
    throw new Error('Mã hóa đơn không hợp lệ');
  }

  const data = await apiRequest(`/kiotviet/invoices/${encodeURIComponent(invoiceCode)}`);
  return data;
}

/**
 * Get customer detail by customer ID from KiotViet
 * @param {number} customerId - Customer ID
 * @returns {Promise<object|null>} Customer data or null if fails
 */
export async function getCustomerById(customerId) {
  if (!customerId) return null;

  try {
    const data = await apiRequest(`/kiotviet/customers/${customerId}`);
    return data;
  } catch (error) {
    // Customer data is optional, return null if fails
    console.error('Failed to fetch customer:', error);
    return null;
  }
}
