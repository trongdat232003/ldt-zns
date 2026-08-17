import { useState, useEffect } from 'react';
import { getInvoiceByCode, getCustomerById } from '../services/invoices.service';
import { getReminderByInvoiceCode } from '../services/reminders.service';

/**
 * Hook lấy chi tiết hóa đơn + khách hàng từ KiotViet qua API proxy,
 * kèm thông tin reminder từ Supabase (note, cancelled, sent, due_date...).
 * @param {string} invoiceCode - Mã hóa đơn
 */
export function useInvoiceDetail(invoiceCode) {
  const [invoice, setInvoice] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [reminder, setReminder] = useState(null);
  const [reminderError, setReminderError] = useState(null);
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
      setReminder(null);
      setReminderError(null);

      try {
        // Lấy chi tiết hóa đơn theo code + reminder song song
        const [invoiceData, reminderResult] = await Promise.all([
          getInvoiceByCode(invoiceCode),
          getReminderByInvoiceCode(invoiceCode),
        ]);

        if (cancelled) return;
        setInvoice(invoiceData);
        setReminder(reminderResult.data);
        setReminderError(reminderResult.error);

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

  return { invoice, customer, reminder, reminderError, loading, error };
}
