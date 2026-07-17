# CẤU TRÚC HÓA ĐƠN KIOTVIET

## 📋 Thông tin từ API `/invoices`

Mỗi hóa đơn có cấu trúc:

```javascript
{
  // Thông tin hóa đơn
  "id": 226336559,
  "code": "HD009797",
  "purchaseDate": "2026-07-16T17:35:00.7500000",
  "total": 175000,
  "totalPayment": 175000,
  "status": 1,
  "statusValue": "Hoàn thành",
  "description": "",
  
  // Thông tin khách hàng
  "customerId": 1009707292,
  "customerCode": "KH000921",
  "customerName": "36-C2 079.71 VISONI",
  
  // ⭐ QUAN TRỌNG: Danh sách sản phẩm
  "invoiceDetails": [
    {
      "productId": 30902421,
      "productCode": "SP013802",
      "productName": "Nhớt Xe Ga TOTAL 700 10W40 0,8L",  // ← TÊN SẢN PHẨM
      "categoryId": 1000319016,
      "categoryName": "Nhớt TOTAL",                      // ← DANH MỤC (KEY)
      "tradeMarkName": "TOTAL",                          // ← THƯƠNG HIỆU
      "quantity": 1,
      "price": 175000,
      "note": "3 Tặng 1. ODO: 42.788 KM"                // ← GHI CHÚ (có ODO)
    }
  ]
}
```

## 🔍 CÁCH NHẬN DIỆN HÓA ĐƠN THAY NHỚT

### **Cách 1: Dựa vào `categoryName`** ✅ (CHÍNH XÁC NHẤT)

```javascript
categoryName.includes("Nhớt")
// "Nhớt TOTAL"
// "Nhớt CASTROL"
// "Nhớt MOTUL"
```

### **Cách 2: Dựa vào `productName`**

```javascript
productName.toLowerCase().includes("nhớt")
// "Nhớt Xe Ga TOTAL 700 10W40 0,8L"
// "Nhớt Xe Số CASTROL POWER 1 10W40 0,8L"
```

### **Cách 3: Dựa vào `tradeMarkName`**

```javascript
const oilBrands = ["TOTAL", "CASTROL", "MOTUL", "SHELL"];
oilBrands.includes(tradeMarkName)
```

### **Cách 4: Dựa vào pattern trong tên**

```javascript
// Nhớt thường có mã số như 10W40, 5W30
/\d+W\d+/i.test(productName)
// "10W40", "5W30", "15W40"
```

## 📊 VÍ DỤ TỪ DATA THẬT

### ✅ Hóa đơn THAY NHỚT:

```json
{
  "code": "HD009797",
  "customerName": "36-C2 079.71 VISONI",
  "total": 175000,
  "invoiceDetails": [
    {
      "productName": "Nhớt Xe Ga TOTAL 700 10W40 0,8L",
      "categoryName": "Nhớt TOTAL",  // ← KEY
      "quantity": 1,
      "price": 175000,
      "note": "3 Tặng 1. ODO: 42.788 KM"  // ← Có thông tin ODO
    }
  ]
}
```

### ❌ Hóa đơn KHÔNG PHẢI THAY NHỚT:

```json
{
  "code": "HD009794",
  "customerName": "78-D1 331.68 VISOIN",
  "total": 775000,
  "invoiceDetails": [
    {
      "productName": "Lột Keo Xe",
      "categoryName": "DỊCH VỤ"  // ← Không có "Nhớt"
    },
    {
      "productName": "Rửa Xe Bọt Tuyết",
      "categoryName": "Rửa Xe"
    },
    {
      "productName": "Vỏ 90/90/14 NaBubb (VAT)",
      "categoryName": "Vỏ Xe"
    }
  ]
}
```

## 💡 ỨNG DỤNG

### **Use case 1: Chỉ gửi tin cho khách thay nhớt**

```javascript
const oilInvoices = allInvoices.filter(inv => 
  inv.invoiceDetails?.some(item => 
    item.categoryName?.includes("Nhớt")
  )
);
```

### **Use case 2: Gửi tin nhắc bảo dưỡng sau X km**

Lấy ODO từ `note`:
```javascript
const odoMatch = item.note?.match(/ODO[:\s]*([0-9.,]+)\s*KM/i);
if (odoMatch) {
  const currentOdo = parseInt(odoMatch[1].replace(/[.,]/g, ""));
  // Nhắc lại sau 3000km
  const nextMaintenanceOdo = currentOdo + 3000;
}
```

### **Use case 3: Template khác nhau cho dịch vụ khác nhau**

```javascript
if (categoryName.includes("Nhớt")) {
  // Dùng template "Thông báo thay nhớt"
  templateId = 499466;
} else if (categoryName.includes("Vỏ")) {
  // Dùng template "Thông báo thay lốp"
  templateId = 499467;
} else {
  // Dùng template chung
  templateId = 499462;
}
```

## 🎯 KẾT LUẬN

**Cách TỐT NHẤT để nhận diện hóa đơn thay nhớt:**

```javascript
function isOilChangeInvoice(invoice) {
  return invoice.invoiceDetails?.some(item => 
    item.categoryName?.toLowerCase().includes("nhớt")
  );
}
```

**Đơn giản, chính xác, dựa vào category có sẵn từ hệ thống KiotViet!** ✅
