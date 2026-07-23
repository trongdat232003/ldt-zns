# 📐 CODING STANDARDS: WEB DASHBOARD (apps/dashboard)

Tài liệu này thống nhất **cách code, cách tổ chức, cách thêm tính năng mới, cách gọi API, quy ước giao diện, loading, lỗi và thông báo** cho dự án Web Dashboard (ZNS Automation). Mọi thành viên (và AI hỗ trợ code) nên tuân theo tài liệu này để codebase nhất quán.

---

## 📑 MỤC LỤC
1. [Nguyên Tắc Chung](#1-nguyên-tắc-chung)
2. [Cấu Trúc Thư Mục Chuẩn](#2-cấu-trúc-thư-mục-chuẩn)
3. [Quy Ước Đặt Tên & Code Style](#3-quy-ước-đặt-tên--code-style)
4. [Quy Trình Thêm Một Tính Năng Mới](#4-quy-trình-thêm-một-tính-năng-mới)
5. [Quy Ước Gọi API (Data Layer)](#5-quy-ước-gọi-api-data-layer)
6. [Quy Ước Giao Diện (UI Components)](#6-quy-ước-giao-diện-ui-components)
7. [Quy Ước Loading State](#7-quy-ước-loading-state)
8. [Quy Ước Xử Lý & Hiển Thị Lỗi](#8-quy-ước-xử-lý--hiển-thị-lỗi)
9. [Quy Ước Thông Báo (Toast/Notification)](#9-quy-ước-thông-báo-toastnotification)
10. [Quy Ước Phân Quyền (RBAC) Khi Thêm Trang Mới](#10-quy-ước-phân-quyền-rbac-khi-thêm-trang-mới)
11. [Checklist Trước Khi Merge](#11-checklist-trước-khi-merge)

---

## 1. NGUYÊN TẮC CHUNG

- **Nhất quán hơn "đúng tuyệt đối"**: nếu một pattern đã tồn tại trong code cũ, hãy theo pattern đó thay vì tự sáng tạo cách mới, trừ khi refactor có chủ đích.
- **Tách lớp rõ ràng**: Page (UI) → Hook/Service (logic gọi data) → Supabase Client / Express API (data source). Không gọi `supabase.from(...)` trực tiếp rải rác trong JSX.
- **Không hard-code chuỗi UI lặp lại** (nhãn trạng thái, màu badge, thông báo lỗi) — đưa vào file constants dùng chung.
- **Ưu tiên component nhỏ, tái sử dụng** hơn là 1 file Page khổng lồ xử lý mọi thứ.

---

## 2. CẤU TRÚC THƯ MỤC CHUẨN

Bổ sung 3 thư mục còn thiếu so với hiện trạng để tách bạch rõ tầng dữ liệu, hook và thành phần dùng chung:

```
apps/dashboard/src/
├── assets/
├── components/
│   ├── common/            # Button, Modal, Table, Badge, EmptyState, Spinner...
│   ├── Layout.jsx
│   └── Layout.css
├── contexts/
│   └── AuthContext.jsx
├── hooks/                  # ⭐ MỚI: custom hooks gọi data (useReminders, useProducts...)
├── lib/
│   ├── supabase.js
│   └── apiClient.js        # ⭐ MỚI: wrapper gọi Express Admin API (fetch/axios chung)
├── services/                # ⭐ MỚI: hàm thuần gọi Supabase/API theo domain
│   ├── reminders.service.js
│   ├── products.service.js
│   └── users.service.js
├── constants/                # ⭐ MỚI: enum trạng thái, message, role
│   ├── status.js
│   └── messages.js
├── pages/
│   ├── Dashboard.jsx
│   ├── Reminders.jsx
│   ├── Products.jsx
│   ├── Users.jsx
│   └── Login.jsx
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

**Quy tắc:** Page **không** gọi thẳng `supabase.from()`. Page gọi **hook** → hook gọi **service** → service gọi Supabase/API.

---

## 3. QUY ƯỚC ĐẶT TÊN & CODE STYLE

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Component file | PascalCase | `ReminderTable.jsx` |
| Hook file/hàm | camelCase, prefix `use` | `useReminders.js` |
| Service file | domain + `.service.js` | `reminders.service.js` |
| CSS file | trùng tên component | `ReminderTable.css` |
| Biến/hàm | camelCase | `fetchReminders()` |
| Hằng số/enum | UPPER_SNAKE_CASE | `REMINDER_STATUS.SENT` |
| Props boolean | tiền tố `is`/`has` | `isLoading`, `hasError` |

- Dùng **function component + Hooks**, không dùng class component.
- Ưu tiên **arrow function** cho handler nội bộ component; **named function** cho service/hook export.
- Import order: React/thư viện ngoài → lib/services/hooks nội bộ → components → assets/css.
- Không để `console.log` trong code merge lên `main` (dùng `console.error` có kiểm soát nếu cần).

---

## 4. QUY TRÌNH THÊM MỘT TÍNH NĂNG MỚI

Khi thêm 1 tính năng (ví dụ: thêm trang "Báo cáo doanh thu"), làm theo đúng thứ tự:

1. **Xác định quyền truy cập**: tính năng dành cho Admin/Manager/Staff nào? → cập nhật bảng phân quyền trong `App.jsx`.
2. **Service layer**: tạo `report.service.js` trong `services/`, viết các hàm thuần túy (`getRevenueReport(params)`) — chỉ lo gọi data, trả về `{ data, error }`, không chứa logic UI.
3. **Hook layer**: tạo `useRevenueReport.js` trong `hooks/`, dùng service ở bước 2, quản lý `data`, `loading`, `error` bằng `useState`/`useEffect`.
4. **Constants**: thêm status/message liên quan vào `constants/`.
5. **UI Page**: tạo `pages/Reports.jsx`, chỉ gọi hook, render loading/error/data theo chuẩn ở mục 7 & 8.
6. **Routing**: thêm `<Route>` trong `App.jsx`, bọc `ProtectedRoute` đúng role.
7. **Sidebar/Navigation**: thêm menu item trong `Layout.jsx`, ẩn/hiện theo role.
8. **Thông báo**: nếu có thao tác tạo/sửa/xóa, dùng chuẩn toast ở mục 9.
9. **Kiểm thử thủ công** với từng role (admin/manager/staff) trước khi merge.

---

## 5. QUY ƯỚC GỌI API (DATA LAYER)

### 5.1. Gọi trực tiếp Supabase (Dashboard, Reminders, Products)
Tất cả nằm trong `services/*.service.js`, theo format thống nhất:

```js
// services/reminders.service.js
import { supabase } from '../lib/supabase';

export async function getReminders({ status, search } = {}) {
  let query = supabase.from('reminders').select('*');
  if (status && status !== 'all') query = query.eq('status', status);
  if (search) query = query.ilike('customer_name', `%${search}%`);

  const { data, error } = await query.order('due_date', { ascending: true });
  return { data: data ?? [], error };
}
```

Hook tương ứng:

```js
// hooks/useReminders.js
import { useState, useEffect, useCallback } from 'react';
import { getReminders } from '../services/reminders.service';

export function useReminders(filters) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getReminders(filters);
    if (error) setError(error);
    else setData(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}
```

### 5.2. Gọi Express Admin API (chỉ trang Users)
Dùng chung 1 wrapper `lib/apiClient.js` để tự động đính JWT, xử lý lỗi HTTP nhất quán:

```js
// lib/apiClient.js
import { supabase } from './supabase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.message || 'Đã có lỗi xảy ra khi gọi API.');
  }
  return json;
}
```

**Quy tắc bắt buộc:**
- Mọi hàm service **luôn trả về** `{ data, error }` (Supabase) hoặc **throw Error có message tiếng Việt rõ ràng** (Express API) — không để lỗi kỹ thuật sống sượng hiển thị ra UI.
- Không gọi `fetch`/`supabase` trực tiếp trong component.
- Tên hàm service theo động từ: `getX`, `createX`, `updateX`, `deleteX`.

---

## 6. QUY ƯỚC GIAO DIỆN (UI COMPONENTS)

- Toàn bộ màu sắc, spacing, font lấy từ **Design Token** khai báo tại `index.css` (biến CSS `--color-*`, `--space-*`...). Không hard-code mã màu hex trong file CSS của component.
- Component dùng chung (Badge trạng thái, Table, Modal, EmptyState, Spinner, ConfirmDialog) đặt trong `components/common/`, tái sử dụng cho mọi Page thay vì viết lại.
- **Badge trạng thái** dùng chung 1 component `<StatusBadge status={...} />`, map màu theo `constants/status.js`, không viết class màu rời rạc từng trang.
- Table danh sách (Reminders, Products, Users) dùng chung `<DataTable />` với props: `columns`, `rows`, `loading`, `emptyMessage`.
- Trang trống dữ liệu (không có kết quả tìm kiếm/filter) dùng chung `<EmptyState />`, không để bảng trắng trơn.

---

## 7. QUY ƯỚC LOADING STATE

Áp dụng thống nhất 3 cấp độ loading:

| Cấp độ | Khi nào dùng | Cách hiển thị |
|---|---|---|
| **Page loading** | Lần đầu vào trang, chưa có data | Skeleton hoặc `<Spinner />` full khu vực nội dung |
| **Action loading** | Đang submit form / xóa / cập nhật | Disable nút bấm + spinner nhỏ trong nút (`isSubmitting`) |
| **Refetch loading** | Đổi filter/search khi đã có data cũ | Giữ data cũ hiển thị mờ (`opacity: 0.5`) thay vì xóa trắng bảng |

- Biến state loading đặt tên rõ mục đích: `loading` (load trang), `isSubmitting` (đang submit), `isDeletingId` (đang xóa dòng nào) — tránh dùng 1 biến `loading` chung cho mọi hành động khiến cả trang bị khoá khi chỉ 1 dòng đang xử lý.
- Luôn có `finally { setLoading(false) }` để tránh loading treo vĩnh viễn khi lỗi.

---

## 8. QUY ƯỚC XỬ LÝ & HIỂN THỊ LỖI

- **Lỗi khi tải dữ liệu (GET)**: hiển thị inline trong khu vực nội dung bằng `<ErrorState message={...} onRetry={refetch} />`, có nút "Thử lại".
- **Lỗi khi thao tác (POST/PUT/DELETE)**: hiển thị bằng **toast lỗi** (mục 9), form vẫn giữ nguyên dữ liệu người dùng đã nhập.
- **Lỗi validate form**: hiển thị ngay dưới field liên quan, tiếng Việt, không dùng alert().
- Không hiển thị message lỗi gốc từ Supabase/Postgres (VD: `duplicate key value violates...`) trực tiếp cho người dùng cuối — map sang message thân thiện qua `constants/messages.js`:

```js
// constants/messages.js
export const ERROR_MESSAGES = {
  DUPLICATE: 'Dữ liệu đã tồn tại trong hệ thống.',
  NETWORK: 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng.',
  UNAUTHORIZED: 'Bạn không có quyền thực hiện thao tác này.',
  DEFAULT: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
};
```

- Với lỗi 401/403 từ Express API → tự động đăng xuất hoặc điều hướng về `/login`.

---

## 9. QUY ƯỚC THÔNG BÁO (TOAST/NOTIFICATION)

- Dùng **1 hệ thống toast chung** (ví dụ context `ToastContext` hoặc thư viện nhẹ), gọi qua hook `useToast()`:

```js
const toast = useToast();
toast.success('Đã lưu lịch nhắc nhở thành công.');
toast.error('Không thể xóa sản phẩm này.');
```

| Loại | Khi dùng | Thời gian hiển thị |
|---|---|---|
| `success` | Tạo/sửa/xóa thành công | ~3s tự ẩn |
| `error` | Thao tác thất bại | ~5s hoặc tới khi người dùng đóng |
| `warning` | Cảnh báo trước hành động (VD: sắp hết hạn quyền) | ~4s |
| `info` | Thông tin trung tính | ~3s |

- Hành động **xóa (delete)** luôn có `<ConfirmDialog />` xác nhận trước, sau khi xác nhận mới gọi service + hiện toast kết quả.
- Không lạm dụng toast cho lỗi validate field-level (dùng inline error thay vì toast).

---

## 10. QUY ƯỚC PHÂN QUYỀN (RBAC) KHI THÊM TRANG MỚI

Khi thêm route/tính năng mới, luôn xác định rõ theo bảng hiện có:

| Role | Trang được truy cập |
|---|---|
| **Admin** | Tất cả |
| **Manager** | Dashboard, Reminders, Products |
| **Staff** | Dashboard, Reminders |

- Bọc route bằng `<ProtectedRoute allowedRoles={[...]}>`.
- Ẩn menu/nút hành động không thuộc quyền (không chỉ chặn route mà còn ẩn UI tương ứng) để tránh gây nhầm lẫn.
- Thao tác ghi dữ liệu nhạy cảm (users, phân quyền) **luôn** đi qua Express Admin API với Service Role Key ở backend — không bao giờ đưa Service Role Key lên Browser.

---

## 11. CHECKLIST TRƯỚC KHI MERGE

- [ ] Không gọi `supabase`/`fetch` trực tiếp trong file `pages/*`.
- [ ] Có xử lý đủ 3 trạng thái: loading / error / empty / có dữ liệu.
- [ ] Toast thông báo cho mọi thao tác tạo/sửa/xóa.
- [ ] Route mới đã bọc `ProtectedRoute` đúng role.
- [ ] Không hard-code màu sắc ngoài design token ở `index.css`.
- [ ] Không còn `console.log` thừa.
- [ ] Message lỗi hiển thị cho người dùng là tiếng Việt, thân thiện, không lộ lỗi kỹ thuật.
