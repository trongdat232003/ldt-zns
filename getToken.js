const CLIENT_ID = "95fc7101-4286-4d80-84b9-4cc1aab8d546";
const CLIENT_SECRET = "175F94C4AD3F9088C2D03A838670BC17D0749296";

async function getToken() {
  try {
    const nodeFetch = await import("node-fetch");
    const fetch = nodeFetch.default;

    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64",
    );

    console.log("CLIENT_ID:", CLIENT_ID);
    console.log("SECRET_LENGTH:", CLIENT_SECRET.length);

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

    console.log("STATUS:", response.status);

    const result = await response.json();

    console.log("========== RESPONSE ==========");
    console.log(JSON.stringify(result, null, 2));

    if (result.access_token) {
      console.log("\n========== ACCESS TOKEN ==========");
      console.log(result.access_token);
      console.log("\nExpires In:", result.expires_in);
    }
  } catch (error) {
    console.error("ERROR:", error);
  }
}

getToken();
