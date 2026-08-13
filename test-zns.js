import { env } from './packages/shared/src/config.js';

async function test() {
  const payload = {
    template_id: '619498',
    phone: '0935555597',
    data: {
      ten_khach_hang: 'Khách hàng test',
      bien_so_xe: '59-P1 123.45',
      sdt: '0935555597',
      ngay_thang_nam: '04/07/2026',
      thoi_han: 'đến 04/08/2026',
    },
  };

  try {
    const response = await fetch('https://api.yoursales.vn/api/public/zns/send', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${env.ZNS_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
