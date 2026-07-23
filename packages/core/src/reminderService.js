/**
 * Lọc hóa đơn có chứa sản phẩm nhớt
 */
export function isOilInvoice(invoice, oilProductIdsSet) {
  if (!invoice.invoiceDetails || invoice.invoiceDetails.length === 0) return false;
  return invoice.invoiceDetails.some(item => oilProductIdsSet.has(item.productId));
}

/**
 * Tạo một object reminder mới từ KiotViet Invoice
 */
export function buildReminderFromInvoice(invoice, customerPhone) {
  const purchaseDate = new Date(invoice.purchaseDate);
  const dueDate = new Date(purchaseDate);
  dueDate.setDate(dueDate.getDate() + 30); // +30 ngày

  return {
    invoice_code: invoice.code,
    invoice_id: invoice.id,
    customer_id: invoice.customerId,
    customer_code: invoice.customerCode,
    customer_name: invoice.customerName,
    phone: customerPhone,
    purchase_date: purchaseDate.toISOString().split('T')[0],
    due_date: dueDate.toISOString().split('T')[0],
    total: invoice.total,
    products: invoice.invoiceDetails?.slice(0, 3).map(item => ({
      name: item.productName,
      quantity: item.quantity
    })) || [],
    sent: false,
    sent_at: null
  };
}

/**
 * Kiểm tra xem reminder có đến hạn vào một ngày cụ thể hay không
 */
export function isDueToday(reminder, todayIsoStr) {
  return reminder.due_date === todayIsoStr && !reminder.sent;
}
