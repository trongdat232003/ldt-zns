import { env } from '@zns-auto/shared/config';
import { logger } from '@zns-auto/shared/logger';
import { getAccessToken } from './authClient.js';

/**
 * Lấy Access Token kèm Retailer header
 */
async function getKiotVietHeaders() {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    Retailer: env.KIOTVIET_RETAILER,
    Accept: 'application/json'
  };
}

/**
 * Lấy hóa đơn từ KiotViet (có phân trang & lọc thời gian)
 */
export async function fetchInvoices({ fromDateIso, toDateIso, pageSize = 100 }) {
  const headers = await getKiotVietHeaders();
  const allInvoices = [];
  let currentItem = 0;

  logger.info(`📅 Fetching KiotViet invoices from ${fromDateIso.split('T')[0]} to ${toDateIso.split('T')[0]}`);

  while (true) {
    const url = new URL('https://public.kiotapi.com/invoices');
    url.searchParams.append('pageSize', pageSize);
    url.searchParams.append('currentItem', currentItem);
    url.searchParams.append('lastModifiedFrom', fromDateIso);
    url.searchParams.append('lastModifiedTo', toDateIso);

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error(`KiotViet API error fetching invoices: ${response.status}`);
    }

    const result = await response.json();
    if (!result.data || result.data.length === 0) break;

    allInvoices.push(...result.data);
    currentItem += result.data.length;

    if (result.data.length < pageSize) break;
  }

  logger.info(`✅ Total invoices fetched: ${allInvoices.length}`);
  return allInvoices;
}

/**
 * Lấy tất cả sản phẩm từ KiotViet
 */
export async function fetchAllProducts() {
  const headers = await getKiotVietHeaders();
  const allProducts = [];
  let currentItem = 0;
  const pageSize = 100;

  logger.info('📦 Fetching all products from KiotViet...');

  while (true) {
    const url = new URL('https://public.kiotapi.com/products');
    url.searchParams.append('pageSize', pageSize);
    url.searchParams.append('currentItem', currentItem);
    url.searchParams.append('includeInventory', 'false');

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error(`KiotViet API error fetching products: ${response.status}`);
    }

    const result = await response.json();
    if (!result.data || result.data.length === 0) break;

    allProducts.push(...result.data);
    currentItem += result.data.length;

    if (result.data.length < pageSize) break;
  }

  logger.info(`✅ Fetched ${allProducts.length} products`);
  return allProducts;
}

/**
 * Lấy số điện thoại khách hàng bằng customerId
 */
export async function fetchCustomerPhone(customerId) {
  if (!customerId) return null;

  const headers = await getKiotVietHeaders();
  try {
    const response = await fetch(`https://public.kiotapi.com/customers/${customerId}`, { headers });

    if (!response.ok) {
      logger.warn(`⚠️  Failed to get customer ${customerId}`);
      return null;
    }

    const result = await response.json();
    const customer = result?.data || result || {};

    return customer.contactNumber || customer.phone || customer.mobilePhone || customer.subNumber || null;
  } catch (error) {
    logger.error(`❌ Error getting customer ${customerId}: ${error.message}`);
    return null;
  }
}
