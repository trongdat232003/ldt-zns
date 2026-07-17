/**
 * CẤU HÌNH TEMPLATE ZNS
 * 
 * Sau khi tạo template mới trên YourSales, cập nhật thông tin ở đây
 */

module.exports = {
  // Template cũ (chỉ có tên + mã khách hàng)
  TEMPLATE_SIMPLE: {
    id: 499462,
    name: "ZBS HỎI THĂM KHÁCH HÀNG",
    fields: ["ten_khach_hang", "ma_khach_hang"],
  },

  // Template mới (có thêm sản phẩm)
  // TODO: Cập nhật ID sau khi tạo xong
  TEMPLATE_WITH_PRODUCT: {
    id: null, // Thay bằng ID thực sau khi tạo
    name: "Hỏi thăm khách hàng - Có sản phẩm",
    fields: ["ten_khach_hang", "ten_san_pham", "ngay_mua"],
  },

  // Template hiện đang dùng
  CURRENT_TEMPLATE: "SIMPLE", // Đổi thành "WITH_PRODUCT" sau khi có ID mới
};
