/**
 * Version mới - Gửi ZNS với template có sản phẩm
 * Chỉ dùng sau khi có Template ID mới
 */

const { ACCESS_TOKEN, RETAILER } = require("./config");
const templateConfig = require("./template_config");

// Dynamic import for node-fetch
let fetch;
async function getFetch() {
  if (!fetch) {
    const nodeFetch = await import("node-fetch");
    fetch = nodeFetch.default;
  }
  return fetch;
}

/**
 * Gửi ZNS với template có sản phẩm
 */
async function sendZNSWithProduct(invoice, apiKey) {
  const fetch = await getFetch();
  
  const template = templateConfig.TEMPLATE_WITH_PRODUCT;
  
  if (!template.id) {
    throw new Error("Template ID chưa được cấu hình! Vui lòng cập nhật trong template_config.js");
  }

  // Chuẩn bị data theo template
  const data = {
    ten_khach_hang: invoice.customerName,
    ma_khach_hang: invoice.customerCode,
  };

  // Thêm tên sản phẩm nếu có
  if (invoice.productNames) {
    data.ten_san_pham = invoice.productNames;
  }

  // Thêm ngày mua nếu có
  if (invoice.purchaseDate) {
    const date = new Date(invoice.purchaseDate);
    data.ngay_mua = date.toLocaleDateString("vi-VN");
  }

  const response = await fetch("https://api.yoursales.vn/api/public/zns/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      template_id: template.id,
      phone: invoice.phone,
      data: data,
      tracking_id: `${invoice.invoiceId}_${Date.now()}`,
    }),
  });

  const result = await response.json();

  return {
    success: response.ok,
    status: response.status,
    response: result,
  };
}

module.exports = {
  sendZNSWithProduct,
};
