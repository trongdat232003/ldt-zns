/**
 * Phân tích hóa đơn để tìm cách nhận diện loại dịch vụ
 */

const { getAllInvoices } = require("./simpleReminder");

async function analyzeInvoices() {
  console.log("🔍 Analyzing invoices...\n");

  try {
    // Lấy một số hóa đơn mẫu
    const allInvoices = await getAllInvoices({ pageSize: 100 });
    const sampleInvoices = allInvoices.slice(0, 20);

    console.log(`✅ Got ${sampleInvoices.length} invoices to analyze\n`);
    console.log("=" .repeat(80));

    // Phân tích từng hóa đơn
    for (let i = 0; i < sampleInvoices.length; i++) {
      const invoice = sampleInvoices[i];

      console.log(`\n[${i + 1}] Invoice: ${invoice.code}`);
      console.log(`Customer: ${invoice.customerName}`);
      console.log(`Date: ${new Date(invoice.purchaseDate).toLocaleDateString("vi-VN")}`);
      console.log(`Total: ${invoice.total.toLocaleString("vi-VN")} VNĐ`);
      console.log(`Description: ${invoice.description || "(Không có)"}`);
      
      // Phân tích sản phẩm
      if (invoice.invoiceDetails && invoice.invoiceDetails.length > 0) {
        console.log(`Products (${invoice.invoiceDetails.length}):`);
        
        let hasOil = false;
        let hasService = false;
        
        invoice.invoiceDetails.forEach((item, idx) => {
          const productName = item.productName.toLowerCase();
          
          // Check có phải nhớt không
          if (
            productName.includes("nhớt") ||
            productName.includes("oil") ||
            productName.includes("motul") ||
            productName.includes("castrol") ||
            productName.includes("total")
          ) {
            hasOil = true;
            console.log(`  ${idx + 1}. ✅ [NHỚT] ${item.productName}`);
          } 
          // Check có phải dịch vụ không
          else if (
            productName.includes("công thợ") ||
            productName.includes("dịch vụ") ||
            productName.includes("thay") ||
            productName.includes("sửa") ||
            productName.includes("bảo dưỡng")
          ) {
            hasService = true;
            console.log(`  ${idx + 1}. 🔧 [DỊCH VỤ] ${item.productName}`);
          } else {
            console.log(`  ${idx + 1}. 📦 ${item.productName}`);
          }
          
          console.log(`      - Qty: ${item.quantity}, Price: ${item.price.toLocaleString("vi-VN")} VNĐ`);
          if (item.note) {
            console.log(`      - Note: ${item.note}`);
          }
        });

        // Kết luận
        console.log("\n🎯 Phân loại:");
        if (hasOil) {
          console.log("   ✅ Có THAY NHỚT");
        }
        if (hasService) {
          console.log("   🔧 Có DỊCH VỤ kèm theo");
        }
        if (!hasOil && !hasService) {
          console.log("   📦 Chỉ bán hàng");
        }
      } else {
        console.log("Products: Không có");
      }

      console.log("─".repeat(80));
    }

    // Thống kê
    console.log("\n" + "=".repeat(80));
    console.log("📊 STATISTICS");
    console.log("=".repeat(80));

    let oilInvoices = 0;
    let serviceInvoices = 0;
    let otherInvoices = 0;
    const oilKeywords = new Set();
    const categoryStats = {};

    sampleInvoices.forEach((invoice) => {
      if (!invoice.invoiceDetails) return;

      let hasOil = false;
      let hasService = false;

      invoice.invoiceDetails.forEach((item) => {
        const productName = item.productName.toLowerCase();
        
        // Thu thập từ khóa nhớt
        if (productName.includes("nhớt") || productName.includes("oil")) {
          hasOil = true;
          oilKeywords.add(item.productName);
        }

        if (productName.includes("công thợ") || productName.includes("dịch vụ")) {
          hasService = true;
        }

        // Thống kê category
        if (item.categoryName) {
          categoryStats[item.categoryName] = (categoryStats[item.categoryName] || 0) + 1;
        }
      });

      if (hasOil) oilInvoices++;
      else if (hasService) serviceInvoices++;
      else otherInvoices++;
    });

    console.log(`\nHóa đơn thay nhớt: ${oilInvoices}/${sampleInvoices.length}`);
    console.log(`Hóa đơn dịch vụ khác: ${serviceInvoices}/${sampleInvoices.length}`);
    console.log(`Hóa đơn khác: ${otherInvoices}/${sampleInvoices.length}`);

    console.log("\n🏷️  Top Categories:");
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([cat, count]) => {
        console.log(`   ${count}x - ${cat}`);
      });

    console.log("\n🛢️  Các loại nhớt tìm thấy:");
    Array.from(oilKeywords).slice(0, 10).forEach((oil) => {
      console.log(`   - ${oil}`);
    });

    // Đề xuất logic filter
    console.log("\n" + "=".repeat(80));
    console.log("💡 ĐỀ XUẤT LOGIC LỌC HÓA ĐƠN THAY NHỚT:");
    console.log("=".repeat(80));
    console.log(`
function isOilChangeInvoice(invoice) {
  if (!invoice.invoiceDetails) return false;
  
  return invoice.invoiceDetails.some(item => {
    const name = item.productName.toLowerCase();
    const category = (item.categoryName || "").toLowerCase();
    
    // Check tên sản phẩm
    if (name.includes("nhớt") || name.includes("oil")) return true;
    
    // Check category
    if (category.includes("nhớt")) return true;
    
    // Check brand
    const oilBrands = ["motul", "castrol", "total", "shell"];
    return oilBrands.some(brand => name.includes(brand));
  });
}
    `);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

analyzeInvoices();
