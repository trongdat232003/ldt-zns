/**
 * DỮ LIỆU TEST - HÓA ĐƠN GIẢ
 * Dùng để test logic mà không cần gọi API KiotViet
 */

function createMockInvoices() {
  const now = new Date();
  const sixMinutesAgo = new Date(now.getTime() - 6 * 60000);

  return [
    // 1 hóa đơn THAY NHỚT duy nhất - Đủ thời gian (6 phút trước)
    {
      id: 1001,
      code: "HD001",
      purchaseDate: sixMinutesAgo.toISOString(),
      customerId: 888001,
      customerName: "Nguyễn Văn A",
      customerCode: "KH001",
      total: 250000,
      invoiceDetails: [
        {
          productId: 1007579236, // Nhớt TOTAL (có trong oil_product_ids.json)
          productName: "Nhớt TOTAL 10W40",
          categoryName: "Nhớt TOTAL",
          quantity: 1,
          price: 195000,
        },
      ],
    },
  ];
}

// Mock function để lấy SĐT (luôn trả về SĐT test)
async function getMockCustomerPhone(customerId) {
  // Tất cả customer đều dùng SĐT test
  return "0362832045";
}

module.exports = {
  createMockInvoices,
  getMockCustomerPhone,
};
