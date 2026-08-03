import { useState, useEffect } from 'react';
import { getInvoiceByCode, getCustomerById } from '../services/invoices.service';

/**
 * Hook lấy chi tiết hóa đơn + khách hàng từ KiotViet qua API proxy.
 * @param {string} invoiceCode - Mã hóa đơn
 */
export function useInvoiceDetail(invoiceCode) {
  const [invoice, setInvoice] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!invoiceCode) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setInvoice(null);
      setCustomer(null);

      try {
        // Lấy chi tiết hóa đơn theo code
        const invoiceData = await getInvoiceByCode(invoiceCode);

        if (cancelled) return;
        setInvoice(invoiceData);

        // Nếu có customerId thì lấy thêm thông tin khách hàng
        const customerId = invoiceData?.customerId;
        if (customerId) {
          const customerData = await getCustomerById(customerId);
          if (!cancelled) setCustomer(customerData);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [invoiceCode]);

  return { invoice, customer, loading, error };
}
