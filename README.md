# ZNS Auto Reminder

Hệ thống gửi tin nhắn ZNS tự động nhắc nhở khách hàng sau X ngày kể từ lần mua hàng cuối cùng.

## Tính năng

- ✅ Tự động lấy tất cả hóa đơn từ KiotViet
- ✅ Lọc hóa đơn đủ thời gian (30 ngày mặc định)
- ✅ Tự động lấy số điện thoại khách hàng
- ✅ Lấy thông tin sản phẩm từ hóa đơn
- ✅ Gửi tin nhắn ZNS qua YourSales
- ✅ Lưu log tránh gửi trùng
- ✅ **Mỗi hóa đơn = 1 tin nhắn** (1 khách mua 10 lần = gửi 10 tin)

## Cài đặt

```bash
npm install
```

## Cấu hình

Mở file `index.js` và chỉnh sửa phần CONFIG:

```javascript
const CONFIG = {
  // ZNS API
  ZNS_API_KEY: "your_api_key_here",
  ZNS_TEMPLATE_ID: 499462,

  // Thời gian nhắc nhở
  MINUTES_SINCE_PURCHASE: 43200,    // 30 ngày = 43200 phút
  MINUTES_BETWEEN_REMINDERS: 36000, // 25 ngày = 36000 phút

  // Giới hạn số tin gửi mỗi lần chạy
  MAX_SEND_PER_RUN: 50,
};
```

### Thay đổi thời gian nhắc nhở:

```javascript
// Test: Gửi sau 5 phút
MINUTES_SINCE_PURCHASE: 5,

// Production: Gửi sau 30 ngày
MINUTES_SINCE_PURCHASE: 43200,

// Custom: Gửi sau 7 ngày
MINUTES_SINCE_PURCHASE: 10080,  // 7 * 24 * 60
```

## Sử dụng

### Test với data giả (nhanh)

```bash
node test.js
```
- Dùng data giả (không gọi API KiotViet)
- Gửi tin ZNS thật đến số test
- Nhanh, dùng để kiểm tra logic

### Chạy production (data thật)

```bash
node index.js
```
- Lấy data thật từ KiotViet
- Gửi tin cho khách hàng thật
- **Chạy 1 lần rồi dừng** (không loop)
- n8n sẽ schedule chạy mỗi ngày 9h

### Cách 2: Import vào code khác

```javascript
const { runAutoReminder, CONFIG } = require('./index');

// Chạy với config mặc định
await runAutoReminder();

// Hoặc custom config
await runAutoReminder({
  ...CONFIG,
  MINUTES_SINCE_PURCHASE: 5, // Test 5 phút
  MAX_SEND_PER_RUN: 10,
});
```

### Cách 3: Tích hợp với n8n

1. **Execute Command node:**
   ```
   cd D:\LTD\zns-auto && node index.js
   ```

2. **Schedule Trigger:** Chạy mỗi ngày 9AM

3. **Function node:** Import và gọi hàm
   ```javascript
   const { runAutoReminder } = require('D:\\LTD\\zns-auto\\index.js');
   const result = await runAutoReminder();
   return { result };
   ```

## Công cụ hỗ trợ

### Update token KiotViet

Token hết hạn sau 24h, chạy lệnh này để lấy token mới:

```bash
node updateToken.js
```

### Xem danh sách template ZNS

```bash
node getTemplate.js
```

## Cấu trúc dự án

```
📂 zns-auto/
├── 📄 index.js                    ← FILE CHÍNH - Chạy file này
├── 📄 simpleReminder.js           ← Logic xử lý (lấy invoice, gửi ZNS)
├── 📄 simpleReminderLog.js        ← Quản lý log
├── 📄 config.js                   ← Config KiotViet token
├── 📄 updateToken.js              ← Update token KiotViet
├── 📄 getTemplate.js              ← Xem danh sách template ZNS
├── 📄 getToken.js                 ← Lấy token thủ công
├── 📄 ZNS_TEMPLATE_GUIDE.md       ← Hướng dẫn tạo template ZNS
├── 📄 simple_reminder_log.json    ← Log file (tự động tạo)
└── 📄 README.md                   ← File này
```

## Flow hoạt động

```
1. Lấy tất cả hóa đơn từ KiotViet
   ↓
2. Lọc hóa đơn đủ X phút/ngày
   ↓
3. Lọc bỏ hóa đơn đã gửi gần đây
   ↓
4. Lấy số điện thoại khách hàng
   ↓
5. Gửi ZNS (mỗi hóa đơn = 1 tin)
   ↓
6. Lưu log
```

## Ví dụ kết quả

```
📋 Total invoices fetched: 10267
⏰ Invoices due for reminder: 50
⏭️  Skipped (sent recently): 10
📤 Attempted to send: 40
✅ Sent successfully: 38
❌ Failed: 2
```

## Template ZNS

Template hiện tại (ID: 499462) có 2 trường:
- `ten_khach_hang` - Tên khách hàng
- `ma_khach_hang` - Mã khách hàng

Để thêm thông tin sản phẩm, xem hướng dẫn trong `ZNS_TEMPLATE_GUIDE.md`

## Lưu ý

- Token KiotViet hết hạn sau 24h
- ZNS tính phí ~500-1000đ/tin
- Nên test với `MINUTES_SINCE_PURCHASE: 5` trước
- Log lưu trong `simple_reminder_log.json`
- Giới hạn `MAX_SEND_PER_RUN` để tránh spam

## License

ISC
