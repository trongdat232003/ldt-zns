import { env } from '@zns-auto/shared/config';
import { logger } from '@zns-auto/shared/logger';

/**
 * Gửi ZNS cho một hóa đơn
 */
export async function sendZNSMessage(invoice) {
  const displayName = invoice.customer_name;

  try {
    const response = await fetch("https://api.yoursales.vn/api/public/zns/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${env.ZNS_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        template_id: env.ZNS_TEMPLATE_ID,
        phone: invoice.phone,
        data: {
          ten_khach_hang: displayName,
          ma_khach_hang: invoice.customer_code,
          bien_so_xe: "",
          ngay_mua: invoice.purchase_date,
          san_pham_1: invoice.products?.[0]?.name || "",
          ngay_den_han: invoice.due_date,
          san_pham_2: invoice.products?.[1]?.name || "",
          san_pham_3: invoice.products?.[2]?.name || "",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`❌ API ZNS trả về lỗi cho ${invoice.invoice_code}: ${response.status} - ${errorText}`);
      return false;
    }

    const result = await response.json();

    if (result.error) {
      logger.error(`❌ Zalo ZNS Error cho ${invoice.invoice_code}: ${result.message}`);
      return false;
    }

    logger.info(`✅ Gửi ZNS thành công cho ${invoice.invoice_code} (${invoice.phone})`);
    return true;
  } catch (error) {
    logger.error(`❌ Lỗi hệ thống khi gửi ZNS cho ${invoice.invoice_code}: ${error.message}`);
    return false;
  }
}
