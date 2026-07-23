import { logger } from '@zns-auto/shared/logger';
import { ReminderRepository } from '@zns-auto/db/reminderRepository';
import { sendZNSMessage } from '@zns-auto/integrations/zns/znsClient';
import { isDueToday } from '@zns-auto/core/reminderService';

/**
 * Gửi tin nhắn ZNS cho các hóa đơn đến hạn hôm nay
 */
export async function sendDueReminders() {
  logger.info('🚀 STEP 2: SEND DUE REMINDERS');

  const todayStr = new Date().toISOString().split('T')[0];
  const dueReminders = await ReminderRepository.findDueToday(todayStr);

  if (dueReminders.length === 0) {
    logger.info('✅ No reminders due today');
    return 0;
  }

  logger.info(`📋 Found ${dueReminders.length} reminders due today`);

  let successCount = 0;
  let failCount = 0;

  for (const reminder of dueReminders) {
    // Sanity check
    if (!isDueToday(reminder, todayStr)) continue;

    const success = await sendZNSMessage(reminder);

    if (success) {
      await ReminderRepository.markSent(reminder.invoice_code);
      successCount++;
    } else {
      failCount++;
    }

    // Delay 500ms to avoid rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  logger.info(`✅ Finished sending: ${successCount} success, ${failCount} failed`);
  return successCount;
}
