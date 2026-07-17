/**
 * LẤY DANH SÁCH SẢN PHẨM TỪ KIOTVIET
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
async function getAllProducts({ pageSize = 100 } = {}) {
  const fetch = await getFetch();
  const allProducts = [];
  let currentItem = 0;

  while (true) {
    const url = `https://public.kiotapi.com/products?pageSize=${pageSize}&currentItem=${currentItem}`;
    console.log(`Fetching products from ${currentItem}...`);

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

    allProducts.push(...result.data);
    currentItem += result.data.length;

    // Nếu số sản phẩm nhận được ít hơn pageSize => hết data
    if (result.data.length < pageSize) {
      break;
    }
  }

  console.log(`✅ Total products fetched: ${allProducts.length}`);
  return allProducts;
}

/**
 * Lọc sản phẩm theo category
 */
function filterProductsByCategory(products, categoryKeywords) {
  const oilProducts = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const categoryName = (product.categoryName || "").toLowerCase();

    // Check category name có chứa từ khóa không
    let isMatch = false;
    for (let j = 0; j < categoryKeywords.length; j++) {
      if (categoryName.indexOf(categoryKeywords[j].toLowerCase()) !== -1) {
        isMatch = true;
        break;
      }
    }

    if (isMatch) {
      oilProducts.push({
        id: product.id,
        code: product.code,
        name: product.name,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
      });
    }
  }

  return oilProducts;
}

/**
 * Lấy danh sách ID sản phẩm nhớt
 */
async function getOilProductIds() {
  console.log("📦 Getting all products from KiotViet...\n");

  const products = await getAllProducts({ pageSize: 100 });

  console.log("\n🔍 Filtering oil products...");
  const oilProducts = filterProductsByCategory(products, ["nhớt", "oil"]);

  console.log(`✅ Found ${oilProducts.length} oil products\n`);

  // Hiển thị top 10
  console.log("📋 Sample oil products:");
  for (let i = 0; i < Math.min(10, oilProducts.length); i++) {
    const p = oilProducts[i];
    console.log(`${i + 1}. [${p.id}] ${p.name}`);
    console.log(`   Category: ${p.categoryName}`);
  }

  // Trả về danh sách ID
  const ids = oilProducts.map((p) => p.id);
  return { ids, products: oilProducts };
}

module.exports = {
  getAllProducts,
  filterProductsByCategory,
  getOilProductIds,
};

// Test
if (require.main === module) {
  getOilProductIds()
    .then((result) => {
      console.log(`\n✅ Total oil product IDs: ${result.ids.length}`);
      console.log(`First 5 IDs: ${result.ids.slice(0, 5).join(", ")}`);
    })
    .catch((error) => {
      console.error("❌ Error:", error.message);
    });
}
