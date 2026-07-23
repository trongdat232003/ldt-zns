import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// __dirname is D:\LTD\zns-auto\packages\shared\src
// The root .env is at D:\LTD\zns-auto\.env
const envPath = path.resolve(__dirname, '../../../.env');

dotenv.config({ path: envPath });

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  KIOTVIET_CLIENT_ID: z.string().min(1),
  KIOTVIET_CLIENT_SECRET: z.string().min(1),
  KIOTVIET_RETAILER: z.string().min(1),
  ZNS_API_KEY: z.string().min(1),
  ZNS_TEMPLATE_ID: z.string().min(1)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
