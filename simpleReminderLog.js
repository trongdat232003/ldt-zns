const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "simple_reminder_log.json");

/**
 * Đọc log từ file
 */
function readLog() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return {};
    }
    const data = fs.readFileSync(LOG_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Error reading log file:", error.message);
    return {};
  }
}

/**
 * Ghi log vào file
 */
function writeLog(logData) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2), "utf8");
  } catch (error) {
    console.error("❌ Error writing log file:", error.message);
  }
}

/**
 * Kiểm tra hóa đơn đã được gửi tin chưa (trong X phút gần đây)
 */
function hasBeenSentRecently(invoiceId, minutesThreshold = 36000) {
  // 36000 phút = 25 ngày
  const log = readLog();
  const invoiceLog = log[invoiceId];

  if (!invoiceLog || !invoiceLog.lastSentDate) {
    return false;
  }

  const lastSent = new Date(invoiceLog.lastSentDate);
  const now = new Date();
  const minutesSince = Math.floor((now - lastSent) / 60000);

  return minutesSince < minutesThreshold;
}

/**
 * Lọc ra hóa đơn chưa được gửi tin (hoặc đã lâu rồi)
 */
function filterNotSentRecently(invoices, minutesThreshold = 36000) {
  return invoices.filter((invoice) => {
    const wasSent = hasBeenSentRecently(invoice.invoiceId, minutesThreshold);
    if (wasSent) {
      console.log(`⏭️  Skip invoice ${invoice.invoiceCode} - Already sent recently`);
    }
    return !wasSent;
  });
}

/**
 * Ghi log sau khi gửi tin thành công
 */
function markAsSent(invoice, result) {
  const log = readLog();

  log[invoice.invoiceId] = {
    invoiceId: invoice.invoiceId,
    invoiceCode: invoice.invoiceCode,
    customerId: invoice.customerId,
    customerName: invoice.customerName,
    customerCode: invoice.customerCode,
    lastSentDate: new Date().toISOString(),
    success: result.success,
    status: result.status,
    response: result.response,
  };

  writeLog(log);
}

/**
 * Xóa toàn bộ log (để test lại từ đầu)
 */
function clearLog() {
  writeLog({});
  console.log("🗑️  Log cleared");
}

module.exports = {
  readLog,
  hasBeenSentRecently,
  filterNotSentRecently,
  markAsSent,
  clearLog,
};
