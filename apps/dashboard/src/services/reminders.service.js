import { supabase } from '../lib/supabase';
import { REMINDER_STATUS } from '../constants/status';

export async function getReminders({ statusFilter, searchTerm, page, pageSize }) {
  let query = supabase.from('reminders').select('*', { count: 'exact' });

  // Apply status filter
  if (statusFilter === REMINDER_STATUS.SENT) {
    query = query.eq('sent', true);
  } else if (statusFilter === REMINDER_STATUS.PENDING) {
    query = query.eq('sent', false); // Restoring original logic
  } else if (statusFilter === REMINDER_STATUS.FAILED) {
    query = query.eq('sent', false).eq('id', -1); // Restoring original logic for failed
  }

  // Apply search
  if (searchTerm && searchTerm.trim()) {
    query = query.or(`customer_name.ilike.%${searchTerm.trim()}%,invoice_code.ilike.%${searchTerm.trim()}%`);
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

  // Pending (all unsent reminders)
  const { count: pending, error: err3 } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true })
    .eq('sent', false);

  // Recent reminders
  const { data: recent, error: err4 } = await supabase
    .from('reminders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  const error = err1 || err2 || err3 || err4;

  return {
    stats: {
      totalReminders: totalReminders || 0,
      sentToday: sentToday || 0,
      pending: pending || 0,
      failed: 0,
    },
    recentReminders: recent || [],
    error
  };
}
