/**
 * Copy file này thành config.js và điền thông tin thật
 * File config.js sẽ KHÔNG được push lên GitHub (nằm trong .gitignore)
 */

const ACCESS_TOKEN =
  process.env.KIOTVIET_ACCESS_TOKEN ||
  "YOUR_KIOTVIET_TOKEN_HERE";

const RETAILER = process.env.KIOTVIET_RETAILER || "YOUR_RETAILER_CODE_HERE";

module.exports = {
  ACCESS_TOKEN,
  RETAILER,
};
