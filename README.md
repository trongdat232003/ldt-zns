# ZNS Auto Reminder - Nhắc nhở khách hàng thay nhớt

Hệ thống tự động gửi tin nhắn ZNS nhắc khách hàng thay nhớt sau 30 ngày.

## 🚀 Deploy trên Render.com

1. **Push code lên GitHub**
2. **Vào Render.com → New → Web Service**
3. **Connect GitHub repo này**
4. **Cấu hình:**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables** (thêm tất cả từ `.env`):
     ```
     KIOTVIET_ACCESS_TOKEN=...
     KIOTVIET_RETAILER=...
     ZNS_API_KEY=...
     ZNS_TEMPLATE_ID=499462
     SUPABASE_URL=...
     SUPABASE_KEY=...
     API_SECRET=your-secret-key
     DRY_RUN=false
     PORT=3456
     ```
5. **Deploy**

## ⏰ Setup Cron Job

Sau khi deploy, copy URL của Render (VD: `https://your-app.onrender.com`)

**Vào https://console.cron-job.org**:
- **URL**: `https://your-app.onrender.com/run-daily`
- **Method**: POST
- **Headers**: `X-API-Secret: your-secret-key` (giống API_SECRET trong .env)
- **Schedule**: Mỗi ngày 8:00 AM (múi giờ Việt Nam)

## 📊 Kiểm tra

- **Health check**: `GET https://your-app.onrender.com/`
- **Trigger thủ công**: `POST https://your-app.onrender.com/run-daily` (với header `X-API-Secret`)

## 🗄️ Database (Supabase)

Tất cả data lưu trên Supabase:
- `reminders` - Lịch nhắc nhở
- `oil_products` - Danh sách sản phẩm nhớt  
- `sync_state` - Thời điểm sync cuối

## 🔧 Chạy local

```bash
npm install
npm start
```

Hoặc chạy 1 lần:
```bash
npm run daily
```

## 📝 Flow

1. **Mỗi ngày** (trigger bởi cron-job.org):
   - Fetch hoá đơn mới từ KiotViet (incremental sync)
   - Lọc hoá đơn thay nhớt
   - Tạo reminders (ngày mua + 30 ngày)
   - Lưu vào Supabase

2. **Check và gửi**:
   - Lấy reminders đến hạn HÔM NAY
   - Gửi ZNS cho khách hàng
   - Đánh dấu đã gửi

## ⚠️ Lưu ý

- File `.env` KHÔNG được commit lên GitHub
- Đổi `API_SECRET` thành giá trị bảo mật
- Set `DRY_RUN=false` khi chạy production
