/**
 * DỮ LIỆU TEST - HÓA ĐƠN GIẢ
 * Dùng để test logic mà không cần gọi API KiotViet
 */

function createMockInvoices() {
  const now = new Date();
  const sixMinutesAgo = new Date(now.getTime() - 6 * 60000);
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60000);
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60000);

  return [
    // 1. Hóa đơn THAY NHỚT - Đủ thời gian (6 phút trước)
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
          productName: "Nhớt Xe Số TOTAL 700 10W40 1L",
          categoryName: "Nhớt TOTAL",
          quantity: 1,
          price: 195000,
        },
      ],
    },

    // 2. Hóa đơn THAY NHỚT + Dịch vụ khác (10 phút trước)
    {
      id: 1002,
      code: "HD002",
      purchaseDate: tenMinutesAgo.toISOString(),
      customerId: 888002,
      customerName: "Trần Thị B",
      customerCode: "KH002",
      total: 225000,
      invoiceDetails: [
        {
          productId: 1007579243, // Nhớt CASTROL
          productName: "Nhớt Xe Số CASTROL POWER 1 10W40 0,8L",
          categoryName: "Nhớt CASTROL",
          quantity: 1,
          price: 160000,
        },
        {
          productId: 33575452, // Rửa xe (không phải nhớt)
          productName: "Rửa Xe Bọt Tuyết",
          categoryName: "Rửa Xe",
          quantity: 1,
          price: 30000,
        },
      ],
    },

    // 3. Hóa đơn KHÔNG PHẢI NHỚT - Thay lốp (6 phút trước)
    {
      id: 1003,
      code: "HD003",
      purchaseDate: sixMinutesAgo.toISOString(),
      customerId: 888003,
      customerName: "Lê Văn C",
      customerCode: "KH003",
      total: 545000,
      invoiceDetails: [
        {
          productId: 1013280052, // Vỏ xe (không phải nhớt)
          productName: "Vỏ 90/90/14 NaBubb (VAT)",
          categoryName: "Vỏ Xe",
          quantity: 1,
          price: 545000,
        },
      ],
    },

    // 4. Hóa đơn THAY NHỚT - CHƯA ĐỦ THỜI GIAN (2 phút trước)
    {
      id: 1004,
      code: "HD004",
      purchaseDate: twoMinutesAgo.toISOString(),
      customerId: 888004,
      customerName: "Phạm Văn D",
      customerCode: "KH004",
      total: 175000,
      invoiceDetails: [
        {
          productId: 30902421, // Nhớt TOTAL
          productName: "Nhớt Xe Ga TOTAL 700 10W40 0,8L",
          categoryName: "Nhớt TOTAL",
          quantity: 1,
          price: 175000,
        },
      ],
    },

    // 5. Hóa đơn ĐẠI TU - Có nhớt (10 phút trước)
    {
      id: 1005,
      code: "HD005",
      purchaseDate: tenMinutesAgo.toISOString(),
      customerId: 888005,
      customerName: "Hoàng Thị E",
      customerCode: "KH005",
      total: 1500000,
      invoiceDetails: [
        {
          productId: 1012473846, // Đại tu (không phải nhớt)
          productName: "Đại Tu Nồi WAVE 100 (VAT)",
          categoryName: "Đại Tu Nồi WAVE 100",
          quantity: 1,
          price: 900000,
        },
        {
          productId: 1007579256, // Nhớt TOTAL
          productName: "Nhớt TOTAL 700 10W40 1L",
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
