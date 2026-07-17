/**
 * LẤY DANH SÁCH SẢN PHẨM NHỚT
 */

const { getAllProducts } = require("./getAllProducts");
const fs = require("fs");
const path = require("path");

/**
 * Lọc sản phẩm nhớt từ danh sách tất cả sản phẩm
 */
function filterOilProducts(products) {
  const oilProducts = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const categoryName = (product.categoryName || "").toLowerCase();
    const productName = (product.name || "").toLowerCase();

    // Check category có chứa "nhớt"
    if (categoryName.indexOf("nhớt") !== -1) {
      oilProducts.push({
        id: product.id,
        code: product.code,
        name: product.name,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
      });
    }
    // Hoặc tên sản phẩm có "nhớt" nhưng category không phải "Nhớt"
    else if (productName.indexOf("nhớt") !== -1) {
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
 * Lấy và lưu danh sách product IDs của nhớt
 */
async function getAndSaveOilProductIds() {
  console.log("🔍 Getting oil products...\n");

  // Lấy tất cả sản phẩm
  const allProducts = await getAllProducts();

  // Lọc sản phẩm nhớt
  console.log("\n🛢️  Filtering oil products...");
  const oilProducts = filterOilProducts(allProducts);
  console.log(`✅ Found ${oilProducts.length} oil products\n`);

  // Hiển thị sample
  console.log("📋 Sample oil products:");
  for (let i = 0; i < Math.min(10, oilProducts.length); i++) {
    const p = oilProducts[i];
    console.log(`${i + 1}. [${p.id}] ${p.name}`);
    console.log(`   Category: ${p.categoryName}`);
  }

  // Lấy danh sách ID
  const productIds = oilProducts.map((p) => p.id);

  // Lưu vào file
  const outputFile = path.join(__dirname, "oil_product_ids.json");
  fs.writeFileSync(
    outputFile,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        totalProducts: allProducts.length,
        oilProductsCount: oilProducts.length,
        productIds: productIds,
        products: oilProducts,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`\n💾 Saved to: ${outputFile}`);
  console.log(`✅ Total oil product IDs: ${productIds.length}`);

  return { productIds, products: oilProducts };
}

module.exports = {
  filterOilProducts,
  getAndSaveOilProductIds,
};

// Chạy
if (require.main === module) {
  getAndSaveOilProductIds()
    .then((result) => {
      console.log("\n✅ Done!");
      console.log(`Product IDs: ${result.productIds.slice(0, 10).join(", ")}...`);
    })
    .catch((error) => {
      console.error("\n❌ Error:", error.message);
      process.exit(1);
    });
}
