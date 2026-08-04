import { env } from './packages/shared/src/config.js';

async function test() {
  const payload = {
    template_id: "499466",
    phone: "0362832045", // Số test chuẩn
    data: {
      ten_khach_hang: "59-P1 123.45",
      bien_so_xe: "59-P1 123.45",
      sdt: "0362832045",
      ngay_thang_nam: "04/07/2026",
      lan_thay_nhot: "1",
      so_kilomet: "1000" // Biến bị thiếu
    }
  };

  try {
    const response = await fetch("https://api.yoursales.vn/api/public/zns/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${env.ZNS_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const status = response.status;
    const text = await response.text();
    console.log(`\nHTTP ${status}`);
    console.log(`Response:`, text);
  } catch (error) {
    console.error(error);
  }
}

test();
