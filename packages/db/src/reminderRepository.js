import { supabase } from './client.js';

export class ReminderRepository {
  /**
   * Save new reminders to Supabase
   * @param {Object} remindersMap Map of invoice_code to reminder object
   */
  static async insertReminders(remindersMap) {
    const reminderArray = Object.values(remindersMap);
    if (reminderArray.length === 0) return { success: true };

    const { data, error } = await supabase
      .from('reminders')
      .upsert(reminderArray, { onConflict: 'invoice_code' });

    if (error) {
      throw new Error(`Supabase error saving reminders: ${error.message}`);
    }
    return data;
  }

  /**
   * Check if reminder exists
   */
  static async reminderExists(invoiceCode) {
    const { data, error } = await supabase
      .from('reminders')
      .select('invoice_code')
      .eq('invoice_code', invoiceCode)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Supabase error checking reminder: ${error.message}`);
    }
    return !!data;
  }

  /**
   * Tìm các reminder đang chờ gửi (chưa sent, chưa cancelled) của 1 khách hàng
   * (customer_id trong KiotViet tương ứng 1 xe, không phải 1 người)
   */
  static async findPendingByCustomer(customerId) {
    const { data, error } = await supabase
      .from('reminders')
      .select('invoice_code, due_date, purchase_date')
      .eq('customer_id', customerId)
      .eq('sent', false)
      .eq('cancelled', false);

    if (error) {
      throw new Error(`Supabase error finding pending reminders: ${error.message}`);
    }
    return data || [];
  }

  /**
   * Huỷ các reminder cũ (do có hoá đơn thay nhớt mới hơn của cùng khách/xe)
   * @param {Array<{invoiceCode: string, note: string}>} items
   */
  static async cancelReminders(items) {
    if (!items || items.length === 0) return { success: true };

    // Supabase không hỗ trợ update hàng loạt với giá trị note khác nhau trong 1 câu lệnh,
    // nên cập nhật từng dòng.
    for (const { invoiceCode, note } of items) {
      const { error } = await supabase
        .from('reminders')
        .update({ cancelled: true, note })
        .eq('invoice_code', invoiceCode);

      if (error) {
        throw new Error(`Supabase error cancelling reminder ${invoiceCode}: ${error.message}`);
      }
    }
    return { success: true };
  }

  /**
   * Load reminders due today, not sent, and not cancelled
   */
  static async findDueToday(todayIsoStr) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('due_date', todayIsoStr)
      .eq('sent', false)
      .eq('cancelled', false);

    if (error) {
      throw new Error(`Supabase error fetching due reminders: ${error.message}`);
    }
    return data || [];
  }

  /**
   * Mark reminder as sent
   */
  static async markSent(invoiceCode) {
    const { error } = await supabase
      .from('reminders')
      .update({
        sent: true,
        sent_at: new Date().toISOString()
      })
      .eq('invoice_code', invoiceCode);

    if (error) {
      throw new Error(`Supabase error marking sent: ${error.message}`);
    }
    return { success: true };
  }

  /**
   * Load oil product IDs from DB
   */
  static async getOilProductIds() {
    const { data, error } = await supabase
      .from('oil_products')
      .select('product_id');

    if (error) {
      throw new Error(`Supabase error fetching oil products: ${error.message}`);
    }

    return new Set((data || []).map(p => p.product_id));
  }
}