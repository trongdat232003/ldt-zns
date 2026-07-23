# 💻 ARCHITECTURE: WEB DASHBOARD (apps/dashboard)

Tài liệu này mô tả kiến trúc hiện tại của ứng dụng **Web Dashboard** thuộc dự án **ZNS Automation (zns-auto)**.

---

## 📑 MỤC LỤC
1. [Tổng Quan](#1-tổng-quan)
2. [Công Nghệ Sử Dụng](#2-công-nghệ-sử-dụng)
3. [Cấu Trúc Thư Mục](#3-cấu-trúc-thư-mục)
4. [Luồng Xác Thực & Phân Quyền (Auth & RBAC)](#4-luồng-xác-thực--phân-quyền-auth--rbac)
5. [Chi Tiết Các Màn Hình (Pages)](#5-chi-tiết-các-màn-hình-pages)
6. [Giao Tiếp Dữ Liệu (Data Flow)](#6-giao-tiếp-dữ-liệu-data-flow)
7. [Biến Môi Trường (Environment Variables)](#7-biến-môi-trường-environment-variables)

---

## 1. TỔNG QUAN

**Web Dashboard** là giao diện quản trị trực quan dành cho ban quản lý và nhân viên của Linh Thành Đạt. Giao diện cho phép:
- Theo dõi các chỉ số thống kê nhắc nhở thay nhớt theo ngày/tháng.
- Tra cứu danh sách lịch nhắc nhở, lọc trạng thái (Đã gửi, Chờ gửi) và tìm kiếm theo SĐT/Tên khách hàng/Mã hóa đơn.
- Quản lý danh mục sản phẩm dầu nhớt bảo dưỡng.
- Quản lý tài khoản người dùng và phân quyền hệ thống (chỉ dành cho Admin).

---

## 2. CÔNG NGHỆ SỬ DỤNG

| Công nghệ | Thư viện / Công cụ | Vai trò |
|---|---|---|
| **Core Framework** | React 19, Vite 8 | Xây dựng giao diện Single Page Application (SPA) tốc độ cao |
| **Routing** | React Router v7 | Điều hướng trang và bảo mật tuyến đường (Protected Routes) |
| **Icons** | Lucide React | Bộ icon giao diện hiện đại |
| **Styling** | Vanilla CSS (CSS Modules / Global Token System) | Quản lý CSS tùy biến tinh tế tại `src/index.css` |
| **Backend & DB** | Supabase JS Client v2 (`@supabase/supabase-js`) | Kết nối CSDL PostgreSQL & Supabase Auth trực tiếp từ trình duyệt |

---

## 3. CẤU TRÚC THƯ MỤC

```
apps/dashboard/
├── public/
│   ├── favicon.svg
│   └── logo.png
├── src/
│   ├── assets/                # Hình ảnh, logo dự án
│   ├── components/            # Layout chung (Header, Sidebar, Navigation)
│   │   ├── Layout.jsx
│   │   └── Layout.css
│   ├── contexts/              # Quản lý State toàn cục
│   │   └── AuthContext.jsx    # Lưu trữ thông tin User, Token & Role
│   ├── lib/                   # Khởi tạo Client Supabase
│   │   └── supabase.js
│   ├── pages/                 # Các trang giao diện chính
│   │   ├── Dashboard.jsx      # Trang tổng quan thống kê
│   │   ├── Reminders.jsx      # Trang quản lý lịch nhắc nhở
│   │   ├── Products.jsx       # Trang quản lý danh mục nhớt
│   │   ├── Users.jsx          # Trang quản lý tài khoản (Admin)
│   │   └── Login.jsx          # Trang đăng nhập
│   ├── App.jsx                # Định tuyến Router & Phân quyền
│   ├── App.css
│   ├── index.css              # Design System (Màu sắc, Typography, Card, Badge)
│   └── main.jsx               # Render React DOM
├── index.html
├── package.json
└── vite.config.js
```

---

## 4. LUỒNG XÁC THỰC & PHÂN QUYỀN (AUTH & RBAC)

### 4.1. Quản lý trạng thái Đăng nhập (`AuthContext.jsx`)
- Sử dụng **Supabase Auth** để xác thực Email / Password.
- Sau khi đăng nhập thành công, `AuthContext` tự động truy vấn bảng `user_roles` trong Supabase để lấy vai trò (`role`) của người dùng (`admin`, `manager`, hoặc `staff`).

### 4.2. Phân quyền tuyến đường (`ProtectedRoute` trong `App.jsx`)
Hệ thống phân chia 3 cấp vai trò người dùng:
1. **Admin**: Quyền cao nhất — Truy cập tất cả các trang (Dashboard, Reminders, Products, Users).
2. **Manager**: Truy cập Dashboard, Reminders, Products.
3. **Staff**: Truy cập Dashboard, Reminders.

```jsx
// Ví dụ kiểm tra quyền trong App.jsx
<Route 
  path="users" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <Users />
    </ProtectedRoute>
  } 
/>
```

---

## 5. CHI TIẾT CÁC MÀN HÌNH (PAGES)

### 5.1. Trang Đăng Nhập (`Login.jsx`)
- Form nhập Email và Mật khẩu.
- Xử lý đăng nhập thông qua `supabase.auth.signInWithPassword()`.

### 5.2. Trang Tổng Quan (`Dashboard.jsx`)
- Hiển thị các Card thống kê tổng số nhắc nhở, số tin đã gửi thành công, số tin chờ gửi.
- Biểu đồ và danh sách các lịch nhắc nhở sắp đến hạn gần nhất.

### 5.3. Trang Quản Lý Lịch Nhắc (`Reminders.jsx`)
- Bảng tra cứu danh sách reminders từ Supabase.
- Tìm kiếm theo SĐT, Tên khách hàng, Mã hóa đơn KiotViet.
- Bộ lọc trạng thái: **Tất cả**, **Chờ gửi**, **Đã gửi**.

### 5.4. Trang Sản Phẩm (`Products.jsx`)
- Hiển thị danh mục các loại nhớt bảo dưỡng được áp dụng quy trình tự động.
- Cho phép thêm/xóa sản phẩm nhớt (chỉ khả dụng với Admin/Manager).

### 5.5. Trang Người Dùng (`Users.jsx`)
- Quản lý danh sách tài khoản nhân viên.
- Gọi qua Express API (`/api/users`) để thực hiện các thao tác quản trị bằng Service Role Key (Tạo tài khoản mới, đổi mật khẩu, cấp quyền `admin`/`staff`).

---

## 6. GIAO TIẾP DỮ LIỆU (DATA FLOW)

```mermaid
flowchart LR
    Browser["💻 Browser (Dashboard)"]
    SupaAuth["🔐 Supabase Auth"]
    SupaDB[("🗄️ Supabase DB (PostgreSQL)")]
    ExpressAPI["🛡️ Express Admin API (/api/users)"]

    Browser -->|Login / Session| SupaAuth
    Browser -->|Direct Query (Anon Key / RLS)| SupaDB
    Browser -->|Admin Operations (JWT Header)| ExpressAPI
    ExpressAPI -->|Service Role Key| SupaDB
```

- **Query trực tiếp từ Browser**: Các trang `Dashboard`, `Reminders`, `Products` gọi trực tiếp Supabase REST API qua `@supabase/supabase-js` (được bảo vệ bằng Row Level Security - RLS).
- **Gọi qua API trung gian**: Trang `Users` gửi yêu cầu kèm JWT Token tới Server Express Admin API (`/api/users`) để thực hiện các tác vụ tạo/sửa/xóa user bằng Supabase Admin SDK.

---

## 7. BIẾN MÔI TRƯỜNG (ENVIRONMENT VARIABLES)

Các biến môi trường cho Dashboard được lưu tại `apps/dashboard/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

*Lưu ý: Trên Vite, các biến môi trường bắt buộc phải có tiền tố `VITE_` mới có thể truy cập từ mã nguồn phía Browser (`import.meta.env.VITE_*`).*
