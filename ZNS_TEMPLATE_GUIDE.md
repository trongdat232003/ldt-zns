# Hướng dẫn tạo ZNS Template mới

## Bước 1: Truy cập Zalo OA Admin
1. Đăng nhập: https://oa.zalo.me/
2. Chọn Official Account của bạn
3. Vào menu: **Công cụ** → **ZNS (Zalo Notification Service)**
4. Chọn **Quản lý template**
5. Click **Tạo template mới**

## Bước 2: Chọn loại template
- **Loại:** Thông báo chăm sóc khách hàng
- **Ngành hàng:** Ô tô / Xe máy / Dịch vụ sửa chữa

## Bước 3: Nội dung template đề xuất

### Template 1: Hỏi thăm + Sản phẩm mua gần nhất

**Tên template:** Hỏi thăm khách hàng - Có sản phẩm

**Nội dung:**
```
Chào {{ten_khach_hang}}! 👋

Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi.

🔧 Sản phẩm gần nhất: {{ten_san_pham}}
📅 Ngày mua: {{ngay_mua}}

Sau một thời gian sử dụng, bạn cảm thấy sản phẩm/dịch vụ thế nào? Có điều gì cần hỗ trợ không?

📞 Liên hệ: {{sdt_cua_hang}}
📍 Địa chỉ: {{dia_chi_cua_hang}}

Rất mong được phục vụ bạn!
```

**Các trường dữ liệu:**
- `ten_khach_hang` - Tên khách hàng
- `ten_san_pham` - Tên sản phẩm mua gần nhất
- `ngay_mua` - Ngày mua (dd/mm/yyyy)
- `sdt_cua_hang` - SĐT cửa hàng
- `dia_chi_cua_hang` - Địa chỉ cửa hàng

---

### Template 2: Hỏi thăm + Nhiều sản phẩm

**Tên template:** Hỏi thăm khách hàng - Danh sách sản phẩm

**Nội dung:**
```
Xin chào {{ten_khach_hang}}! 

Cảm ơn bạn đã mua hàng tại cửa hàng.

🛒 Đơn hàng gần nhất:
{{danh_sach_san_pham}}

Đã được {{so_ngay}} ngày kể từ lần mua cuối. Sản phẩm còn tốt chứ? Cần hỗ trợ gì không?

Liên hệ: {{sdt_cua_hang}}
```

**Các trường dữ liệu:**
- `ten_khach_hang`
- `danh_sach_san_pham` (có thể nhập nhiều dòng)
- `so_ngay`
- `sdt_cua_hang`

---

### Template 3: Đơn giản - Chỉ thêm 1 sản phẩm

**Tên template:** Hỏi thăm khách hàng V2

**Nội dung:**
```
Chào {{ten_khach_hang}}!

Cảm ơn bạn đã mua {{ten_san_pham}} tại cửa hàng.

Sau thời gian sử dụng, sản phẩm có ổn không? Cần hỗ trợ gì không ạ?

📞 Hotline: {{sdt_cua_hang}}
```

**Các trường dữ liệu:**
- `ten_khach_hang`
- `ten_san_pham`
- `sdt_cua_hang`

---

## Bước 4: Gửi duyệt template
1. Điền đầy đủ thông tin
2. Preview nội dung
3. Click **Gửi duyệt**
4. Đợi Zalo phê duyệt (1-3 ngày làm việc)

## Bước 5: Lấy Template ID
Sau khi được duyệt:
1. Vào **Quản lý template**
2. Click vào template vừa tạo
3. Copy **Template ID** (dạng số: 123456)
4. Cập nhật vào code

---

## 💡 Tips:
- **Tránh spam:** Không dùng từ "khuyến mãi", "giảm giá" quá nhiều
- **Rõ ràng:** Nội dung phải rõ mục đích (chăm sóc, nhắc nhở)
- **Emoji:** Dùng vừa phải, không quá nhiều
- **Độ dài:** Nên dưới 400 ký tự

---

## ⚠️ Lưu ý quan trọng:
- Mỗi template phải được Zalo duyệt trước khi dùng
- Template bị từ chối nếu có nội dung quảng cáo rõ ràng
- Phải có Official Account đã xác thực
- Phí gửi: ~500-1000đ/tin tùy loại template

---

## 🔧 Sau khi có Template ID:

Update vào file `config.js` hoặc `.env`:
```javascript
ZNS_TEMPLATE_ID_WITH_PRODUCT = 123456; // Template ID mới
```

Hoặc update trực tiếp trong script:
```javascript
const ZNS_TEMPLATE_ID = 123456; // ID template mới của bạn
```
