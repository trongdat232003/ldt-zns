// Load environment variables từ .env
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const supabase = require("./lib/supabaseClient");
const { getAccessToken } = require("./lib/kiotvietAuth");

// Đọc từ environment variables
const RETAILER = (process.env.KIOTVIET_RETAILER || "").trim();

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
 * Lấy thời điểm sync lần cuối từ Supabase
 */
async function getLastSyncTime() {
  const { data, error } = await supabase
    .from("sync_state")
    .select("last_sync_time")
    .eq("id", 1)
    .single();

  if (error) {
    console.warn("⚠️  Could not load sync state, using default");
    return new Date("2026-07-01T00:00:00");
  }

  return new Date(data.last_sync_time);
}

/**
 * Format Date sang giờ Việt Nam (GMT+7)
 */
function toVNTimeString(date) {
  const vnOffset = 7 * 60 * 60 * 1000;
  const vnDate = new Date(date.getTime() + vnOffset);
  return vnDate.toISOString().replace("Z", "+07:00");
}

/**
 * Lưu thời điểm sync vào Supabase (giờ VN)
 */
async function saveLastSyncTime(time) {
  const { error } = await supabase
    .from("sync_state")
    .update({
      last_sync_time: toVNTimeString(time),
      updated_at: toVNTimeString(new Date()),
    })
    .eq("id", 1);

  if (error) {
    console.error("❌ Could not save sync state:", error.message);
  }
}

/**
 * Lấy hóa đơn từ KiotViet - INCREMENTAL SYNC
 * @param {Object} options
 * @param {Date} options.fromDate - Lấy từ ngày nào (default: lấy từ lần sync cuối)
 * @param {Date} options.toDate - Đến ngày nào (default: hôm nay)
 * @param {number} options.pageSize - Số records/page
 * @param {boolean} options.useIncrementalSync - Dùng incremental sync (default: true)
 */
async function getAllInvoices({
  fromDate = null,
  toDate = new Date(),
  pageSize = 100,
  useIncrementalSync = true,
} = {}) {
  // Nếu dùng incremental sync, lấy từ lần sync cuối
  if (useIncrementalSync && !fromDate) {
    fromDate = await getLastSyncTime();
  } else if (!fromDate) {
    fromDate = new Date("2026-07-01T00:00:00");
  }
  const fetch = await getFetch();
  const accessToken = await getAccessToken();
  const allInvoices = [];
  let currentItem = 0;

  // Format dates theo KiotViet API (ISO 8601)
  const fromDateStr = fromDate.toISOString();
  const toDateStr = toDate.toISOString();

  console.log(
    `📅 Fetching invoices from ${fromDateStr.split("T")[0]} to ${toDateStr.split("T")[0]}`,
  );

  while (true) {
    // INCREMENTAL: Dùng lastModifiedFrom thay vì lấy toàn bộ
    const url = `https://public.kiotapi.com/invoices?pageSize=${pageSize}&currentItem=${currentItem}&lastModifiedFrom=${fromDateStr}&lastModifiedTo=${toDateStr}`;
    console.log(`Fetching from item ${currentItem}...`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
    currentItem += result.data.length;

    // Nếu số records nhận được ít hơn pageSize => hết data
    if (result.data.length < pageSize) {
      break;
    }
  }

  console.log(`✅ Total invoices fetched: ${allInvoices.length}`);

  // Lưu sync state
  if (useIncrementalSync) {
    await saveLastSyncTime(toDate);
    console.log(`💾 Saved sync state: ${toDate.toISOString()}`);
  }

  return allInvoices;
}

/**
 * Lọc hóa đơn ĐÃ ĐẾN HẠN NHẮC NHỞ (30 ngày từ ngày mua)
 * Logic: Hôm nay >= purchaseDate + 30 ngày
 *
 * @param {Array} invoices - Danh sách hóa đơn
 * @param {number} daysThreshold - Số ngày kể từ lần mua (default: 30)
 * @returns {Array} Danh sách hóa đơn đến hạn nhắc
 */
function filterInvoicesDue(invoices, daysThreshold = 30) {
  const now = new Date();
  const dueInvoices = [];

  for (const invoice of invoices) {
    // Bỏ qua hóa đơn không có khách hàng
    if (!invoice.customerId || !invoice.customerName) {
      continue;
    }

    const purchaseDate = new Date(invoice.purchaseDate);
    const daysSince = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));

    // CHECK: Đã đủ X ngày chưa?
    if (daysSince >= daysThreshold) {
      dueInvoices.push({
        invoiceId: invoice.id,
        invoiceCode: invoice.code,
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        customerCode: invoice.customerCode,
        purchaseDate: purchaseDate,
        daysSince: daysSince,
        dueDate: new Date(
          purchaseDate.getTime() + daysThreshold * 24 * 60 * 60 * 1000,
        ),
        total: invoice.total,
        // GIỮ NGUYÊN invoiceDetails để filter oil sau này
        invoiceDetails: invoice.invoiceDetails || [],
        // Lấy sản phẩm để hiển thị
        products: invoice.invoiceDetails
          ? invoice.invoiceDetails.slice(0, 3).map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
          }))
          : [],
      });
    }
  }

  // Thêm productNames cho dễ hiển thì
  dueInvoices.forEach((inv) => {
    inv.productNames = inv.products.map((p) => p.name).join(", ");
  });

  console.log(
    `✅ Found ${dueInvoices.length} invoices due for reminder (${daysThreshold}+ days)`,
  );
  return dueInvoices;
}

/**
 * Lấy danh sách tất cả sản phẩm từ KiotViet
 */
async function getAllProducts() {
  const fetch = await getFetch();
  const accessToken = await getAccessToken();
  const allProducts = [];
  let currentItem = 0;
  const pageSize = 100;

  console.log("📦 Fetching all products from KiotViet...");

  while (true) {
    const url = `https://public.kiotapi.com/products?pageSize=${pageSize}&currentItem=${currentItem}&includeInventory=false`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

    allProducts.push(...result.data);
    currentItem += result.data.length;

    if (result.data.length < pageSize) {
      break;
    }
  }

  console.log(`✅ Fetched ${allProducts.length} products`);
  return allProducts;
}

/**
 * Lọc sản phẩm nhớt và lưu vào Supabase
 */
async function getOilProductIds() {
  // Check Supabase trước
  const { data: existing, error: selectError } = await supabase
    .from("oil_products")
    .select("product_id");

  if (!selectError && existing && existing.length > 0) {
    const productIds = existing.map((p) => p.product_id);
    console.log(`✅ Loaded ${productIds.length} oil product IDs from Supabase`);
    return productIds;
  }

  // Nếu chưa có, fetch từ API
  console.log("🛢️  Fetching oil products from API...");
  const allProducts = await getAllProducts();

  // Lọc sản phẩm có category chứa "nhớt" (case insensitive)
  const oilProducts = allProducts.filter(
    (p) => p.categoryName && p.categoryName.toLowerCase().includes("nhớt"),
  );

  // Lưu vào Supabase
  const oilData = oilProducts.map((p) => ({
    product_id: p.id,
    product_name: p.name,
    category_name: p.categoryName,
  }));

  const { error: insertError } = await supabase
    .from("oil_products")
    .upsert(oilData, { onConflict: "product_id" });

  if (insertError) {
    console.error("⚠️  Could not save to Supabase:", insertError.message);
  } else {
    console.log(`💾 Saved ${oilData.length} oil products to Supabase`);
  }

  const productIds = oilProducts.map((p) => p.id);
  console.log(`✅ Found ${productIds.length} oil products`);

  return productIds;
}

/**
 * Kiểm tra hoá đơn có chứa sản phẩm nhớt không
 */
function isOilInvoice(invoice, oilProductIds) {
  if (!invoice.invoiceDetails || invoice.invoiceDetails.length === 0) {
    return false;
  }

  return invoice.invoiceDetails.some((item) =>
    oilProductIds.includes(item.productId),
  );
}

/**
 * Lọc chỉ lấy hoá đơn thay nhớt
 */
function filterOilInvoices(invoices, oilProductIds) {
  return invoices.filter((inv) => isOilInvoice(inv, oilProductIds));
}
async function getCustomerPhone(customerId) {
  if (!customerId) {
    return null;
  }

  const fetch = await getFetch();
  const accessToken = await getAccessToken();
  try {
    const response = await fetch(
      `https://public.kiotapi.com/customers/${customerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Retailer: RETAILER,
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      console.warn(`⚠️  Failed to get customer ${customerId}`);
      return null;
    }

    const result = await response.json();
    const customer = result?.data || result || {};

    return (
      customer.contactNumber ||
      customer.phone ||
      customer.mobilePhone ||
      customer.subNumber ||
      null
    );
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

  // CHỈ DÙNG TÊN KHÁCH HÀNG (không ghép sản phẩm nữa)
  // Vì template có giới hạn độ dài field "ten_khach_hang"
  const displayName = invoice.customerName;

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
        ten_khach_hang: displayName, // CHỈ TÊN KHÁCH HÀNG
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
  getLastSyncTime,
  saveLastSyncTime,
  getAllProducts,
  getOilProductIds,
  filterOilInvoices,
};

// Test nếu chạy trực tiếp
if (require.main === module) {
  (async () => {
    const lastSync = await getLastSyncTime();
    console.log(`📋 Last sync: ${lastSync.toLocaleString("vi-VN")}`);
    console.log(`📋 Fetching NEW/UPDATED invoices (incremental sync)...\n`);

    const invoices = await getAllInvoices({
      pageSize: 100,
      useIncrementalSync: false, // Lấy tất cả để test
      fromDate: new Date("2026-07-01"),
    });

    // Lấy danh sách nhớt
    console.log("\n🛢️  Loading oil product IDs...");
    const oilProductIds = await getOilProductIds();

    // Lọc hoá đơn nhớt
    console.log("\n🛢️  Filtering oil invoices...");
    const oilInvoices = filterOilInvoices(invoices, oilProductIds);
    console.log(
      `✅ Found ${oilInvoices.length} oil invoices (out of ${invoices.length} total)`,
    );

    // Lọc đến hạn
    console.log("\n⏰ Filtering due invoices (30 days)...");
    const dueInvoices = filterInvoicesDue(oilInvoices, 30);

    console.log("\n📊 RESULT:");
    dueInvoices.slice(0, 5).forEach((inv, i) => {
      console.log(`\n${i + 1}. ${inv.customerName} (${inv.customerCode})`);
      console.log(`   Invoice: ${inv.invoiceCode}`);
      console.log(
        `   Purchase: ${inv.purchaseDate.toLocaleDateString("vi-VN")}`,
      );
      console.log(`   Due date: ${inv.dueDate.toLocaleDateString("vi-VN")}`);
      console.log(`   Days ago: ${inv.daysSince} days`);
      console.log(`   Products: ${inv.productNames}`);
    });
  })();
}
