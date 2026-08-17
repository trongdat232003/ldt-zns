import { supabase } from '../lib/supabase';
import { REMINDER_STATUS } from '../constants/status';

export async function getReminders({
  statusFilter,
  searchTerm,
  purchaseDate,
  dueDate,
  page,
  pageSize,
}) {
  let query = supabase.from('reminders').select('*', { count: 'exact' });

  // Apply status filter
  if (statusFilter === REMINDER_STATUS.SENT) {
    query = query.eq('sent', true);
  } else if (statusFilter === REMINDER_STATUS.PENDING) {
    query = query.eq('sent', false).eq('cancelled', false);
  } else if (statusFilter === REMINDER_STATUS.CANCELLED) {
    query = query.eq('cancelled', true);
  } else if (statusFilter === REMINDER_STATUS.FAILED) {
    query = query.eq('sent', false).eq('id', -1);
  }

  // Apply search
  if (searchTerm && searchTerm.trim()) {
    // Sanitize: remove PostgREST special chars to prevent filter injection
    const term = searchTerm.trim().replace(/[,.()"'\\]/g, '');
    if (term) {
      query = query.or(
        `customer_name.ilike.%${term}%,invoice_code.ilike.%${term}%,note.ilike.%${term}%`,
      );
    }
  }

  if (purchaseDate) {
    query = query.eq('purchase_date', purchaseDate);
  }

  if (dueDate) {
    query = query.eq('due_date', dueDate);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  return { data: data || [], count: count || 0, error };
}

export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];

  // Total reminders
  const { count: totalReminders, error: err1 } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true });

  // Sent today
  const { count: sentToday, error: err2 } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true })
    .eq('sent', true)
    .gte('sent_at', `${today}T00:00:00`);

  // Pending (active unsent reminders)
  const { count: pending, error: err3 } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true })
    .eq('sent', false)
    .eq('cancelled', false);

  // Cancelled reminders
  const { count: cancelled, error: err4 } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true })
    .eq('cancelled', true);

  // Recent reminders
  const { data: recent, error: err5 } = await supabase
    .from('reminders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  const error = err1 || err2 || err3 || err4 || err5;

  return {
    stats: {
      totalReminders: totalReminders || 0,
      sentToday: sentToday || 0,
      pending: pending || 0,
      cancelled: cancelled || 0,
      failed: 0,
    },
    recentReminders: recent || [],
    error,
  };
}

/**
 * Lấy thông tin reminder từ Supabase theo invoice_code
 * Dùng cho trang chi tiết hoá đơn
 */
export async function getReminderByInvoiceCode(invoiceCode) {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('invoice_code', invoiceCode)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found (0 rows) — acceptable
    return { data: null, error };
  }
  return { data: data || null, error: null };
}
