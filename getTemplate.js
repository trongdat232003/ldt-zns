// Dynamic import for node-fetch (ESM module)
const API_KEY = process.env.ZNS_API_KEY || "";

if (!API_KEY) {
  console.error("❌ ERROR: ZNS_API_KEY is missing!");
  console.error("   Please set environment variable: ZNS_API_KEY");
  process.exit(1);
}

async function getTemplates() {
  const nodeFetch = await import("node-fetch");
  const fetch = nodeFetch.default;

  const response = await fetch(
    "https://api.yoursales.vn/api/public/zns/templates",
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${API_KEY}`,
        Accept: "application/json",
      },
    },
  );

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
  
  // Tìm template 499462
  if (result.data) {
    const template = result.data.find(t => t.template_id === 499462);
    if (template) {
      console.log("\n========== TEMPLATE 499462 ==========");
      console.log("Name:", template.template_name);
      console.log("Params:", template.list_params);
    }
  }
}

getTemplates();
