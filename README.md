# ZNS Auto Reminder - Nhắc nhở khách hàng thay nhớt

Hệ thống tự động gửi tin nhắn ZNS nhắc khách hàng thay nhớt sau 30 ngày.

## 🚀 Setup (3 bước)

### 1. Push code lên GitHub

```bash
git add .
git commit -m "Setup ZNS reminder system"
git push
```

### 2. Thêm Secrets vào GitHub

Vào **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

Thêm các secrets sau (copy từ file `.env`):

- `KIOTVIET_CLIENT_ID`
- `KIOTVIET_CLIENT_SECRET`
- `KIOTVIET_RETAILER`
- `ZNS_API_KEY`
- `ZNS_TEMPLATE_ID` (giá trị: `499462`)
- `SUPABASE_URL`
- `SUPABASE_KEY`

### 3. Xong!

GitHub Actions sẽ tự động chạy **mỗi ngày lúc 8:00 sáng** (múi giờ Việt Nam).

## 🧪 Test thủ công

Vào **GitHub → Actions → Daily ZNS Reminder → Run workflow** để test ngay.

## 📊 Kiểm tra logs

Vào **GitHub → Actions → Daily ZNS Reminder** để xem log mỗi lần chạy.

## 🗄️ Database (Supabase)

Tất cả data lưu trên Supabase:
- `reminders` - Lịch nhắc nhở
- `oil_products` - Danh sách sản phẩm nhớt  
- `sync_state` - Thời điểm sync cuối

## 🔧 Chạy local

```bash
npm install
npm run daily
```

## 📝 Flow

1. **Mỗi ngày 8:00 AM** (tự động bởi GitHub Actions):
   - Fetch hoá đơn mới từ KiotViet (incremental sync)
   - Lọc hoá đơn thay nhớt
   - Tạo reminders (ngày mua + 30 ngày)
   - Lưu vào Supabase

2. **Check và gửi**:
   - Lấy reminders đến hạn HÔM NAY
   - Gửi ZNS cho khách hàng
   - Đánh dấu đã gửi

## ⚠️ Lưu ý

- File `.env` KHÔNG được commit lên GitHub (đã có trong `.gitignore`)
- Tất cả secrets lưu an toàn trên GitHub Actions
- **FREE 100%** - GitHub Actions miễn phí cho public repos

