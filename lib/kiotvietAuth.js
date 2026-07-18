require("dotenv").config();

// Dynamic import for node-fetch (ESM module)
let fetchFn;
async function getFetch() {
  if (!fetchFn) {
    const nodeFetch = await import("node-fetch");
    fetchFn = nodeFetch.default;
  }
  return fetchFn;
}

const CLIENT_ID = (process.env.KIOTVIET_CLIENT_ID || "").trim();
const CLIENT_SECRET = (process.env.KIOTVIET_CLIENT_SECRET || "").trim();

// Cache token trong memory
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Lấy Access Token từ KiotViet OAuth2
 * Tự động refresh khi hết hạn
 */
async function getAccessToken() {
  // Fallback: Nếu có token trong env mà không có CLIENT_ID (dành cho manual/local test)
  const envToken = (process.env.KIOTVIET_ACCESS_TOKEN || "").trim();
  if (envToken && !CLIENT_ID) {
    return envToken;
  }

  // Nếu token còn hạn, dùng cache
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("⚠️  Missing KIOTVIET_CLIENT_ID or KIOTVIET_CLIENT_SECRET in environment variables");
  }

  // Lấy token mới từ OAuth2
  console.log("🔑 Fetching new KiotViet access token via OAuth2...");
  const fetch = await getFetch();

  const response = await fetch("https://id.kiotviet.vn/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      scopes: "PublicApi.Access",
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`❌ Failed to get KiotViet token: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  cachedToken = result.access_token;
  // Trừ 60s để refresh sớm hơn, tránh dùng token sắp hết hạn khi request đang chạy
  tokenExpiresAt = Date.now() + (result.expires_in - 60) * 1000;

  console.log(`✅ Got new KiotViet token (expires in ${result.expires_in}s)`);
  return cachedToken;
}

module.exports = {
  getAccessToken,
};
