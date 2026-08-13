import { env } from '@zns-auto/shared/config';
import { logger } from '@zns-auto/shared/logger';

/**
 * Gửi ZNS cho một hóa đơn
 */
export async function sendZNSMessage(invoice) {
  const displayName = invoice.customer_name;

  try {
    const response = await fetch('https://api.yoursales.vn/api/public/zns/send', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${env.ZNS_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        template_id: env.ZNS_TEMPLATE_ID,
        phone: invoice.phone,
        // data: {
        //   ten_khach_hang: displayName,
        //   bien_so_xe: displayName,
        //   sdt: invoice.phone,
        //   ngay_thang_nam: invoice.purchase_date,
        //   lan_thay_nhot: "1",
        //   so_kilomet: ""
        // },
        data: {
          ten_khach_hang: displayName,
          bien_so_xe: displayName,
          sdt: invoice.phone,
          ngay_thang_nam: invoice.purchase_date,
          thoi_han: `đến ${invoice.due_date}`,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        `❌ API ZNS trả về lỗi cho ${invoice.invoice_code}: HTTP ${response.status} - ${errorText}`,
      );
      return false;
    }

    const result = await response.json();

    if (result.error) {
      logger.error(`❌ Zalo ZNS Error cho ${invoice.invoice_code}: ${result.message}`);
      return false;
    }

    logger.info(`✅ Gửi ZNS thành công cho ${invoice.invoice_code}`);
    return true;
  } catch (error) {
    logger.error(`❌ Lỗi hệ thống khi gửi ZNS cho ${invoice.invoice_code}: ${error.message}`);
    return false;
  }
}
