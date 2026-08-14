import { env } from '@zns-auto/shared/config';
import { logger } from '@zns-auto/shared/logger';

/**
 * Chuẩn hoá SĐT về đúng định dạng 0xxxxxxxxx (10 số)
 * Xử lý case KiotViet lưu dư số 0 ở đầu: 00813745627 -> 0813745627
 */
function normalizePhone(rawPhone) {
  if (!rawPhone) return '';

  let phone = String(rawPhone).trim().replace(/\D/g, ''); // bỏ ký tự lạ nếu có

  // Bỏ các số 0 thừa ở đầu, chỉ giữ đúng 1 số 0
  phone = phone.replace(/^0+/, '0');

  return phone;
}

export async function sendZNSMessage(invoice) {
  const displayName = invoice.customer_name;
  const phone = normalizePhone(invoice.phone); // <-- chuẩn hoá tại đây

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
        phone, // dùng số đã chuẩn hoá
        data: {
          ten_khach_hang: displayName,
          bien_so_xe: displayName,
          sdt: phone,
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
