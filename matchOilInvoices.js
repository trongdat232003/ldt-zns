/**
 * MATCH HÓA ĐƠN VỚI DANH SÁCH SẢN PHẨM NHỚT
 * Cách AN TOÀN NHẤT: Dựa vào productId
 */

const fs = require("fs");
const path = require("path");

/**
 * Đọc danh sách product IDs từ file
 */
function loadOilProductIds() {
  const filePath = path.join(__dirname, "oil_product_ids.json");
  
  if (!fs.existsSync(filePath)) {
    throw new Error("File oil_product_ids.json not found! Run 'node getOilProducts.js' first.");
  }

  const data = fs.readFileSync(filePath, "utf8");
  const json = JSON.parse(data);
  
  return json.productIds;
}

/**
 * Kiểm tra hóa đơn có chứa sản phẩm nhớt không
 * Dựa vào productId - CHÍNH XÁC 100%
 */
function isOilChangeInvoice(invoice, oilProductIds) {
  if (!invoice.invoiceDetails || invoice.invoiceDetails.length === 0) {
    return false;
  }

  // Check từng sản phẩm trong hóa đơn
  for (let i = 0; i < invoice.invoiceDetails.length; i++) {
    const item = invoice.invoiceDetails[i];
    const productId = item.productId;

    // Check productId có trong danh sách nhớt không
    for (let j = 0; j < oilProductIds.length; j++) {
      if (productId === oilProductIds[j]) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Lọc hóa đơn thay nhớt
 */
function filterOilChangeInvoices(invoices, oilProductIds) {
  const oilInvoices = [];

  for (let i = 0; i < invoices.length; i++) {
    if (isOilChangeInvoice(invoices[i], oilProductIds)) {
      oilInvoices.push(invoices[i]);
    }
  }

  return oilInvoices;
}

module.exports = {
  loadOilProductIds,
  isOilChangeInvoice,
  filterOilChangeInvoices,
};

// Test
if (require.main === module) {
  console.log("🧪 TEST MATCH OIL INVOICES\n");

  try {
    // Load danh sách product IDs
    const oilProductIds = loadOilProductIds();
    console.log(`✅ Loaded ${oilProductIds.length} oil product IDs`);
    console.log(`First 5 IDs: ${oilProductIds.slice(0, 5).join(", ")}\n`);

    // Test data
    const testInvoices = [
      {
        code: "HD001",
        invoiceDetails: [
          { productId: 1007579256, productName: "Nhớt TOTAL 700" },
        ],
      },
      {
        code: "HD002",
        invoiceDetails: [
          { productId: 9999999, productName: "Vỏ Xe" },
        ],
      },
    ];

    console.log("📋 Testing invoices:");
    testInvoices.forEach((inv) => {
      const isOil = isOilChangeInvoice(inv, oilProductIds);
      console.log(`${inv.code}: ${isOil ? "✅ OIL CHANGE" : "❌ NOT OIL"}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}
