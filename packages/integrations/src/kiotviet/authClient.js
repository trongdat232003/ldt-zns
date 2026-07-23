import { env } from '@zns-auto/shared/config';
import { logger } from '@zns-auto/shared/logger';

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Lấy Access Token từ KiotViet OAuth2
 */
export async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  logger.info("🔑 Fetching new KiotViet access token via OAuth2...");

  const response = await fetch("https://id.kiotviet.vn/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      scopes: "PublicApi.Access",
      grant_type: "client_credentials",
      client_id: env.KIOTVIET_CLIENT_ID,
      client_secret: env.KIOTVIET_CLIENT_SECRET,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`❌ Failed to get KiotViet token: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  cachedToken = result.access_token;
  tokenExpiresAt = Date.now() + (result.expires_in - 60) * 1000;

  logger.info(`✅ Got new KiotViet token (expires in ${result.expires_in}s)`);
  return cachedToken;
}
