const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");

// Polyfill cho Node 16
if (!globalThis.fetch) {
  globalThis.fetch = require("node-fetch");
  globalThis.Headers = require("node-fetch").Headers;
  globalThis.Request = require("node-fetch").Request;
  globalThis.Response = require("node-fetch").Response;
}

if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket;
}

// Load từ .env
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in .env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
