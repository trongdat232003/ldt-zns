import { logger } from '@zns-auto/shared/logger';
import { ReminderRepository } from '@zns-auto/db/reminderRepository';
import { fetchInvoices, fetchAllProducts, fetchCustomerPhone } from '@zns-auto/integrations/kiotviet/invoiceClient';
import { isOilInvoice, buildReminderFromInvoice } from '@zns-auto/core/reminderService';

/**
 * Thu thập hóa đơn từ KiotViet và lưu vào Supabase
 */
export async function collectNewReminders() {
  logger.info('📥 STEP 1: COLLECT NEW REMINDERS');

  // Incremental sync - get last sync time from DB if implemented, otherwise last 24h
  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000); // Tạm thời dùng 24h trước

  const invoices = await fetchInvoices({
    fromDateIso: fromDate.toISOString(),
    toDateIso: toDate.toISOString()
  });

  if (invoices.length === 0) {
    logger.info('✅ No new invoices');
    return 0;
  }

  const oilProductIdsSet = await ReminderRepository.getOilProductIds();
  
  if (oilProductIdsSet.size === 0) {
    // If empty, fetch from API and save
    const allProducts = await fetchAllProducts();
    // Implementation to save oil products would go here...
    // For now, we assume the DB is populated manually or by a separate sync script
    logger.warn('⚠️ No oil products found in DB. Make sure they are synced.');
  }

  const oilInvoices = invoices.filter(inv => isOilInvoice(inv, oilProductIdsSet));
  logger.info(`✅ Found ${oilInvoices.length} oil invoices (out of ${invoices.length})`);

  if (oilInvoices.length === 0) return 0;

  const newRemindersMap = {};
  let skipCount = 0;

  for (const invoice of oilInvoices) {
    const exists = await ReminderRepository.reminderExists(invoice.code);
    if (exists) {
      skipCount++;
      continue;
    }

    const phone = await fetchCustomerPhone(invoice.customerId);
    if (!phone) {
      logger.warn(`⚠️ No phone found for customer ${invoice.customerId}`);
      continue;
    }

    newRemindersMap[invoice.code] = buildReminderFromInvoice(invoice, phone);
  }

  const newCount = Object.keys(newRemindersMap).length;
  if (newCount > 0) {
    await ReminderRepository.insertReminders(newRemindersMap);
    logger.info(`✅ Saved ${newCount} new reminders`);
  }

  if (skipCount > 0) {
    logger.info(`⏭️ Skipped ${skipCount} existing reminders`);
  }

  return newCount;
}
