// Đọc từ environment variables (không cần config.js)
const ACCESS_TOKEN = process.env.KIOTVIET_ACCESS_TOKEN || "";
const RETAILER = process.env.KIOTVIET_RETAILER || "";

// Dynamic import for node-fetch (ESM module)
let fetch;
async function getFetch() {
  if (!fetch) {
    const nodeFetch = await import("node-fetch");
    fetch = nodeFetch.default;
  }
  return fetch;
}

/**
 * Lấy tất cả hóa đơn từ KiotViet
 */
async function getAllInvoices({ pageSize = 100 } = {}) {
  const fetch = await getFetch();
  const allInvoices = [];
  let page = 1;

  while (true) {
    const url = `https://public.kiotapi.com/invoices?page=${page}&pageSize=${pageSize}`;
    console.log(`Fetching page ${page}...`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        Retailer: RETAILER,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`KiotViet API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      break;
    }

    allInvoices.push(...result.data);

    if (result.data.length < pageSize) {
      break;
    }

    page += 1;
  }

  console.log(`✅ Total invoices fetched: ${allInvoices.length}`);
  return allInvoices;
}

/**
 * Lọc hóa đơn đủ thời gian (30 ngày hoặc 5 phút test)
 */
function filterInvoicesDue(invoices, minutesThreshold = 43200) {
  // 30 ngày = 43200 phút
  // 5 phút test = 5 phút
  
  const now = new Date();
  const dueInvoices = [];

  for (const invoice of invoices) {
    // Bỏ qua hóa đơn không có khách hàng
    if (!invoice.customerId || !invoice.customerName) {
      continue;
    }

    const purchaseDate = new Date(invoice.purchaseDate);
    const minutesSince = Math.floor((now - purchaseDate) / 60000);

    if (minutesSince >= minutesThreshold) {
      dueInvoices.push({
        invoiceId: invoice.id,
        invoiceCode: invoice.code,
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        customerCode: invoice.customerCode,
        purchaseDate: purchaseDate,
        minutesSince: minutesSince,
        daysSince: Math.floor(minutesSince / 1440),
        total: invoice.total,
        // GIỮ NGUYÊN invoiceDetails để filter oil sau này
        invoiceDetails: invoice.invoiceDetails || [],
        // Lấy sản phẩm để hiển thị
        products: invoice.invoiceDetails ? invoice.invoiceDetails.slice(0, 3).map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })) : [],
      });
    }
  }

  // Thêm productNames cho dễ hiển thị
  dueInvoices.forEach(inv => {
    inv.productNames = inv.products.map(p => p.name).join(", ");
  });

  console.log(`✅ Found ${dueInvoices.length} invoices due for reminder`);
  return dueInvoices;
}

/**
 * Lấy số điện thoại khách hàng
 */
async function getCustomerPhone(customerId) {
  const fetch = await getFetch();
  try {
    const response = await fetch(
      `https://public.kiotapi.com/customers/${customerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          Retailer: RETAILER,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(`⚠️  Failed to get customer ${customerId}`);
      return null;
    }

    const result = await response.json();
    return result.data?.contactNumber || null;
  } catch (error) {
    console.error(`❌ Error getting customer ${customerId}:`, error.message);
    return null;
  }
}

/**
 * Gửi ZNS cho một hóa đơn
 */
async function sendZNSForInvoice(invoice, apiKey, templateId) {
  const fetch = await getFetch();
  
  // HACK: Ghép tên sản phẩm vào tên khách hàng
  let displayName = invoice.customerName;
  
  if (invoice.productNames) {
    // Giới hạn tổng độ dài: <= 50 ký tự cho an toàn
    const maxLength = 50;
    const nameLength = invoice.customerName.length;
    const availableForProduct = maxLength - nameLength - 5; // -5 cho "\n📦 "
    
    let productText = invoice.productNames;
    if (availableForProduct > 0 && productText.length > availableForProduct) {
      productText = productText.substring(0, availableForProduct - 3) + "...";
    } else if (availableForProduct <= 0) {
      // Tên khách hàng quá dài, chỉ dùng tên không thêm sản phẩm
      displayName = invoice.customerName.substring(0, maxLength - 3) + "...";
      productText = "";
    }
    
    if (productText) {
      displayName = `${invoice.customerName}\n📦 ${productText}`;
    }
  }
  
  const response = await fetch("https://api.yoursales.vn/api/public/zns/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
      phone: invoice.phone,
      data: {
        ten_khach_hang: displayName, // HACK: Tên + Sản phẩm
        ma_khach_hang: invoice.customerCode,
      },
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

// Export
module.exports = {
  getAllInvoices,
  filterInvoicesDue,
  getCustomerPhone,
  sendZNSForInvoice,
};

// Test nếu chạy trực tiếp
if (require.main === module) {
  (async () => {
    console.log("📋 Fetching invoices...");
    const invoices = await getAllInvoices({ pageSize: 100 });
    
    console.log("\n⏰ Filtering due invoices (5 minutes test)...");
    const dueInvoices = filterInvoicesDue(invoices, 5); // 5 phút test
    
    console.log("\n📊 RESULT:");
    dueInvoices.slice(0, 5).forEach((inv, i) => {
      console.log(`\n${i + 1}. ${inv.customerName} (${inv.customerCode})`);
      console.log(`   Invoice: ${inv.invoiceCode}`);
      console.log(`   Date: ${inv.purchaseDate.toLocaleString()}`);
      console.log(`   Minutes ago: ${inv.minutesSince}`);
      console.log(`   Products: ${inv.productNames}`);
    });
  })();
}
