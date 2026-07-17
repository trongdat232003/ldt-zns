// Load environment variables
require("dotenv").config();

const fs = require("fs");
const path = require("path");

// Dynamic import for node-fetch (ESM module)
let fetch;
async function getFetch() {
  if (!fetch) {
    const nodeFetch = await import("node-fetch");
    fetch = nodeFetch.default;
  }
  return fetch;
}

// File để lưu token
const TOKEN_FILE = path.join(__dirname, "..", ".kiotviet-token.json");

/**
 * Lấy access token mới từ KiotViet OAuth2
 * Sử dụng Client ID + Client Secret
 */
async function getNewAccessToken() {
  const CLIENT_ID = process.env.KIOTVIET_CLIENT_ID || "";
  const CLIENT_SECRET = process.env.KIOTVIET_CLIENT_SECRET || "";
  const RETAILER = process.env.KIOTVIET_RETAILER || "";

  if (!CLIENT_ID || !CLIENT_SECRET || !RETAILER) {
    throw new Error(
      "Missing KIOTVIET_CLIENT_ID, KIOTVIET_CLIENT_SECRET, or KIOTVIET_RETAILER in .env",
    );
  }

  const fetch = await getFetch();

  console.log("🔑 Requesting new KiotViet access token...");

  const response = await fetch("https://id.kiotviet.vn/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
      scopes: "PublicApi.Access",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`KiotViet OAuth error: ${response.status} - ${error}`);
  }

  const result = await response.json();

  const tokenData = {
    access_token: result.access_token,
    expires_in: result.expires_in, // Thường là 86400 (24 giờ)
    token_type: result.token_type,
    created_at: Date.now(),
    expires_at: Date.now() + result.expires_in * 1000,
  };

  // Lưu token vào file
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
  console.log(`✅ New token saved (expires in ${result.expires_in / 3600}h)`);

  return tokenData.access_token;
}

/**
 * Lấy token hiện tại (từ file hoặc tạo mới)
 */
async function getAccessToken() {
  // Nếu có token trong env (manual), dùng luôn
  if (process.env.KIOTVIET_ACCESS_TOKEN) {
    console.log("🔑 Using token from KIOTVIET_ACCESS_TOKEN env");
    return process.env.KIOTVIET_ACCESS_TOKEN;
  }

  // Check token trong file
  if (fs.existsSync(TOKEN_FILE)) {
    const tokenData = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));

    // Kiểm tra còn hạn không (buffer 5 phút)
    const now = Date.now();
    const expiresAt = tokenData.expires_at || 0;

    if (now < expiresAt - 5 * 60 * 1000) {
      console.log(
        `🔑 Using cached token (expires in ${Math.floor((expiresAt - now) / 1000 / 60)} minutes)`,
      );
      return tokenData.access_token;
    }

    console.log("⚠️  Token expired, refreshing...");
  }

  // Lấy token mới
  return await getNewAccessToken();
}

/**
 * Force refresh token
 */
async function refreshToken() {
  return await getNewAccessToken();
}

module.exports = {
  getAccessToken,
  refreshToken,
  getNewAccessToken,
};

// Test nếu chạy trực tiếp
if (require.main === module) {
  (async () => {
    try {
      const token = await getAccessToken();
      console.log("\n✅ Access Token:");
      console.log(token);
    } catch (error) {
      console.error("\n❌ Error:", error.message);
    }
  })();
}
