import { logger } from '@zns-auto/shared/logger';
import { collectNewReminders } from './collect.js';
import { sendDueReminders } from './send.js';

async function runJob() {
  logger.info('🕒 Starting ZNS Automation Worker...');
  
  try {
    await collectNewReminders();
    await sendDueReminders();
    logger.info('🎉 Worker finished successfully');
  } catch (error) {
    logger.error(`❌ Worker failed with error: ${error.message}`);
    process.exit(1);
  }
}

runJob();
