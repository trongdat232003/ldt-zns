/**
 * TEST GỬI 1 TIN ZNS ĐƠN GIẢN
 */

async function testZNS() {
  const fetch = (await import("node-fetch")).default;
  
  const ZNS_API_KEY = "ZmVkZGE5ZjYtMGVkMy00YTVlLWJkNzAtYzA4NDNkYTM1N2I4OjEyNGNlNDExLWI1YTAtNGNmYi1hYjhkLThhODNlZWQxNDRiMA==";
  const ZNS_TEMPLATE_ID = 499462;
  const PHONE = "0362832045";
  
  console.log("📤 Sending ZNS test...");
  console.log(`   Phone: ${PHONE}`);
  console.log(`   Template ID: ${ZNS_TEMPLATE_ID}`);
  console.log("");

  try {
    const response = await fetch("https://api.yoursales.vn/api/public/zns/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${ZNS_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        template_id: ZNS_TEMPLATE_ID,
        phone: PHONE,
        data: {
          ten_khach_hang: "Test Customer\n📦 Nhớt Test",
          ma_khach_hang: "TEST001",
        },
        tracking_id: `TEST_${Date.now()}`,
      }),
    });

    const result = await response.json();

    console.log("📊 Response:");
    console.log(`   Status: ${response.status}`);
    console.log(`   Body:`, JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log("\n✅ GỬI THÀNH CÔNG!");
      console.log("📱 Kiểm tra Zalo:");
      console.log("   1. Mở app Zalo");
      console.log("   2. Vào tab 'Thông báo ZNS' (dưới cùng)");
      console.log("   3. HOẶC tìm 'Tin nhắn từ doanh nghiệp'");
    } else {
      console.log("\n❌ GỬI THẤT BẠI!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testZNS();
