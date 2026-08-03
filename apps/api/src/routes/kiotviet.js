import express from 'express';
import { getAccessToken } from '@zns-auto/integrations/kiotviet/authClient';
import { env } from '@zns-auto/shared/config';

const router = express.Router();

async function getKiotVietHeaders() {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    Retailer: env.KIOTVIET_RETAILER,
    Accept: 'application/json',
  };
}

/**
 * GET /api/kiotviet/invoices/:invoiceCode
 * Lấy chi tiết hóa đơn theo mã hóa đơn (code)
 */
router.get('/invoices/:invoiceCode', async (req, res) => {
  try {
    const { invoiceCode } = req.params;
    const headers = await getKiotVietHeaders();

    const response = await fetch(
      `https://public.kiotapi.com/invoices/code/${encodeURIComponent(invoiceCode)}`,
      { headers }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `KiotViet API error: ${response.status} - ${text}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/kiotviet/customers/:customerId
 * Lấy chi tiết khách hàng theo ID
 */
router.get('/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const headers = await getKiotVietHeaders();

    const response = await fetch(
      `https://public.kiotapi.com/customers/${encodeURIComponent(customerId)}`,
      { headers }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `KiotViet API error: ${response.status} - ${text}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
