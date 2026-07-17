const fs = require("fs");
const path = require("path");

const CLIENT_ID = "95fc7101-4286-4d80-84b9-4cc1aab8d546";
const CLIENT_SECRET = "175F94C4AD3F9088C2D03A838670BC17D0749296";

async function getAndUpdateToken() {
  try {
    const nodeFetch = await import("node-fetch");
    const fetch = nodeFetch.default;

    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );

    console.log("🔑 Getting new access token...");

    const response = await fetch("https://id.kiotviet.vn/connect/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scopes: "PublicApi.Access",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status}`);
    }

    const result = await response.json();

    if (!result.access_token) {
      throw new Error("No access token in response");
    }

    console.log("✅ Token received!");
    console.log("Expires in:", result.expires_in, "seconds");

    // Update config.js
    const configPath = path.join(__dirname, "config.js");
    const newConfig = `const ACCESS_TOKEN =
  process.env.KIOTVIET_ACCESS_TOKEN ||
  "${result.access_token}";
const RETAILER = process.env.KIOTVIET_RETAILER || "linhthanhdat434";

module.exports = {
  ACCESS_TOKEN,
  RETAILER,
};
`;

    fs.writeFileSync(configPath, newConfig, "utf8");
    console.log("✅ config.js updated!");

    console.log("\n🎉 Done! You can now run your scripts.");

    return result.access_token;
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

getAndUpdateToken();
