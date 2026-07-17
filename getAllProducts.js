/**
 * LẤY TẤT CẢ SẢN PHẨM TỪ KIOTVIET
 */

const { ACCESS_TOKEN, RETAILER } = require("./config");

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
 * Lấy tất cả sản phẩm từ KiotViet
 */
async function getAllProducts() {
  const fetch = await getFetch();
  const allProducts = [];
  let currentItem = 0;
  const pageSize = 100;

  console.log("📦 Fetching all products from KiotViet...\n");

  while (true) {
    const url = `https://public.kiotapi.com/products?pageSize=${pageSize}&currentItem=${currentItem}`;
    console.log(`📄 Fetching from item ${currentItem}...`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        Retailer: RETAILER,
        Accept: "application/json",
      },
    });

    console.log(`   Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`KiotViet API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      console.log("   No more products");
      break;
    }

    console.log(`   Got ${result.data.length} products`);
    allProducts.push(...result.data);
    currentItem += result.data.length;

    // Nếu số sản phẩm nhận được ít hơn pageSize => hết data
    if (result.data.length < pageSize) {
      console.log("   Last page reached");
      break;
    }
  }

  console.log(`\n✅ Total products fetched: ${allProducts.length}`);
  return allProducts;
}

// Test - Chạy và hiển thị kết quả
if (require.main === module) {
  getAllProducts()
    .then((products) => {
      console.log("\n" + "=".repeat(70));
      console.log("📊 SAMPLE PRODUCTS (first 5):");
      console.log("=".repeat(70));

      for (let i = 0; i < Math.min(5, products.length); i++) {
        const p = products[i];
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Code: ${p.code}`);
        console.log(`   Category: ${p.categoryName} (ID: ${p.categoryId})`);
        if (p.fullName) {
          console.log(`   Full name: ${p.fullName}`);
        }
      }

      console.log("\n" + "=".repeat(70));
      console.log("✅ Done!");
    })
    .catch((error) => {
      console.error("\n❌ Error:", error.message);
      process.exit(1);
    });
}

module.exports = {
  getAllProducts,
};
