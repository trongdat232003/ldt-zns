# WORKFLOW HOÀN CHỈNH - ZNS AUTO REMINDER

## 📋 MỤC TIÊU

Gửi tin nhắn ZNS tự động cho khách hàng **THAY NHỚT** sau 30 ngày kể từ lần mua cuối.

---

## 🔄 WORKFLOW CHI TIẾT

### **GIAI ĐOẠN 1: SETUP (Chỉ chạy 1 lần hoặc khi có sản phẩm mới)**

#### Bước 1: Update Token KiotViet
```bash
node updateToken.js
```
→ Token hết hạn sau 24h, chạy lại khi cần

#### Bước 2: Lấy danh sách sản phẩm nhớt
```bash
node getOilProducts.js
```
→ Lưu vào: `oil_product_ids.json` (116 sản phẩm nhớt)
→ Chạy lại khi có sản phẩm mới trong kho

---

### **GIAI ĐOẠN 2: CHẠY HÀNG NGÀY (n8n schedule: 9h sáng)**

#### Bước 3: Chạy script chính
```bash
node index.js
```

**Flow bên trong `index.js`:**

```
┌─────────────────────────────────────────────────────────┐
│ 1. LẤY TẤT CẢ HÓA ĐƠN                                   │
│    API: GET /invoices                                   │
│    → ~10,000 hóa đơn                                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. LỌC HÓA ĐƠN ĐỦ 30 NGÀY                              │
│    Điều kiện: now - purchaseDate >= 30 ngày            │
│    → ~50 hóa đơn                                        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. MATCH VỚI DANH SÁCH SẢN PHẨM NHỚT                   │
│    Load: oil_product_ids.json                          │
│    Check: invoice.productId có trong danh sách?        │
│    → ~30 hóa đơn THAY NHỚT                             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. LỌC BỎ ĐÃ GỬI GẦN ĐÂY                              │
│    Check: simple_reminder_log.json                     │
│    Điều kiện: Chưa gửi trong 25 ngày gần đây           │
│    → ~20 hóa đơn cần gửi                               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 5. LẤY SỐ ĐIỆN THOẠI                                    │
│    API: GET /customers/{id}                            │
│    Lấy: contactNumber                                  │
│    → 20 hóa đơn có SĐT                                 │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 6. GỬI TIN NHẮN ZNS                                    │
│    API: POST /zns/send                                 │
│    Template: 499462                                    │
│    Data: {ten_khach_hang, ma_khach_hang}              │
│    → 18 tin gửi thành công                             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 7. LƯU LOG                                             │
│    Ghi vào: simple_reminder_log.json                   │
│    Mục đích: Tránh gửi trùng lần sau                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 FILE STRUCTURE

```
zns-auto/
├── index.js                      ← FILE CHÍNH (chạy hàng ngày)
├── config.js                     ← Token KiotViet
├── updateToken.js                ← Update token mới
│
├── getAllProducts.js             ← Lấy tất cả sản phẩm
├── getOilProducts.js             ← Lọc sản phẩm nhớt
├── oil_product_ids.json          ← Danh sách ID nhớt (116 IDs)
│
├── simpleReminder.js             ← Logic lấy invoice, gửi ZNS
├── simpleReminderLog.js          ← Quản lý log
├── matchOilInvoices.js           ← Match invoice với nhớt
├── simple_reminder_log.json      ← Log đã gửi
│
├── test.js                       ← Test với data giả
├── getToken.js                   ← Tool lấy token thủ công
├── getTemplate.js                ← Xem template ZNS
└── README.md                     ← Hướng dẫn
```

---

## ⚙️ CÁCH CHẠY

### **1. Setup lần đầu:**
```bash
# Lấy token
node updateToken.js

# Lấy danh sách sản phẩm nhớt
node getOilProducts.js
```

### **2. Test:**
```bash
# Test với data giả
node test.js

# Hoặc test với data thật (dry-run)
# TODO: Cần tạo script dry-run
```

### **3. Production:**
```bash
# Chạy thủ công
node index.js

# Hoặc schedule với n8n (mỗi ngày 9h)
```

---

## 🎯 N8N WORKFLOW

```
┌────────────────────┐
│ Schedule Trigger   │
│ Cron: 0 9 * * *   │ ← Mỗi ngày 9h sáng
└────────────────────┘
          ↓
┌────────────────────┐
│ Execute Command    │
│ cd D:\LTD\zns-auto│
│ node index.js      │
└────────────────────┘
          ↓
┌────────────────────┐
│ Parse Output       │
│ Check success      │
└────────────────────┘
          ↓
┌────────────────────┐
│ Send Notification  │
│ Telegram/Email     │
│ Báo kết quả        │
└────────────────────┘
```

---

## 🔧 BẢO TRÌ

### **Mỗi ngày:**
- ✅ n8n tự động chạy `node index.js`
- ✅ Check notification kết quả

### **Mỗi tuần:**
- 🔄 Check log file: `simple_reminder_log.json`
- 📊 Xem báo cáo: Số tin đã gửi

### **Mỗi tháng:**
- 🔄 Chạy lại: `node getOilProducts.js` (nếu có sản phẩm mới)
- 🗑️ Dọn dẹp log cũ (nếu cần)

### **Khi có sản phẩm nhớt mới:**
```bash
node getOilProducts.js
```

### **Khi token hết hạn (401 error):**
```bash
node updateToken.js
```

---

## 📊 KẾT QUẢ DỰ KIẾN

**Input:**
- 10,000 hóa đơn trong hệ thống
- 116 sản phẩm nhớt

**Output:**
- ~20-30 tin nhắn/ngày
- Chi phí: ~500đ/tin = ~15,000đ/ngày

**Hiệu quả:**
- Tự động chăm sóc khách hàng
- Nhắc nhở thay nhớt đúng lúc
- Tăng tỷ lệ quay lại

---

## 🚨 XỬ LÝ LỖI

### **Lỗi 401 - Token hết hạn:**
```bash
node updateToken.js
```

### **File oil_product_ids.json không tồn tại:**
```bash
node getOilProducts.js
```

### **API KiotViet chậm/lỗi:**
- Script tự động retry
- Log chi tiết trong console
- Notification qua n8n

---

## ✅ CHECKLIST HÀNG NGÀY

- [ ] n8n chạy thành công
- [ ] Nhận notification kết quả
- [ ] Kiểm tra số tin đã gửi
- [ ] Không có lỗi trong log
