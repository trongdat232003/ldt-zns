const supabase = require("./supabaseClient");

/**
 * Lưu reminders vào Supabase
 */
async function saveReminders(reminders) {
  const reminderArray = Object.values(reminders);
  
  if (reminderArray.length === 0) {
    return { success: true, count: 0 };
  }

  // Upsert (insert hoặc update nếu đã tồn tại)
  const { data, error } = await supabase
    .from("reminders")
    .upsert(reminderArray, { onConflict: "invoice_code" });

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return { success: true, count: reminderArray.length };
}

/**
 * Lấy reminders theo tháng
 */
async function loadRemindersByMonth(year, month) {
  const monthStr = String(month).padStart(2, "0");
  const startDate = `${year}-${monthStr}-01`;
  const endDate = `${year}-${monthStr}-31`;

  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .gte("due_date", startDate)
    .lte("due_date", endDate);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  // Convert array to object với key là invoice_code
  const reminders = {};
  data.forEach((r) => {
    reminders[r.invoice_code] = r;
  });

  return reminders;
}

/**
 * Lấy reminders đến hạn hôm nay và chưa gửi
 */
async function loadDueTodayReminders() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("due_date", today)
    .eq("sent", false);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
}

/**
 * Đánh dấu reminder đã gửi
 */
async function markReminderAsSent(invoiceCode) {
  const { error } = await supabase
    .from("reminders")
    .update({ 
      sent: true, 
      sent_at: new Date().toISOString() 
    })
    .eq("invoice_code", invoiceCode);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return { success: true };
}

/**
 * Check reminder đã tồn tại chưa
 */
async function reminderExists(invoiceCode) {
  const { data, error } = await supabase
    .from("reminders")
    .select("invoice_code")
    .eq("invoice_code", invoiceCode)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = not found (OK)
    throw new Error(`Supabase error: ${error.message}`);
  }

  return !!data;
}

module.exports = {
  saveReminders,
  loadRemindersByMonth,
  loadDueTodayReminders,
  markReminderAsSent,
  reminderExists,
};
