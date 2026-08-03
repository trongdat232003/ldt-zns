# 📐 CODING STANDARDS: WEB DASHBOARD (apps/dashboard)

Tài liệu này thống nhất **cách code, cách tổ chức, cách thêm tính năng mới, cách gọi API, quy ước giao diện, loading, lỗi và thông báo** cho dự án Web Dashboard (ZNS Automation). Mọi thành viên (và AI hỗ trợ code) nên tuân theo tài liệu này để codebase nhất quán.

---

## 📑 MỤC LỤC
1. [Nguyên Tắc Chung](#1-nguyên-tắc-chung)
2. [Cấu Trúc Thư Mục Chuẩn](#2-cấu-trúc-thư-mục-chuẩn)
3. [Quy Ước Đặt Tên & Code Style](#3-quy-ước-đặt-tên--code-style)
4. [Quy Trình Thêm Một Tính Năng Mới](#4-quy-trình-thêm-một-tính-năng-mới)
5. [Quy Ước Gọi API (Data Layer)](#5-quy-ước-gọi-api-data-layer)
6. [Quy Ước Tìm Kiếm (Search Pattern)](#6-quy-ước-tìm-kiếm-search-pattern)
7. [Quy Ước Giao Diện (UI Components)](#7-quy-ước-giao-diện-ui-components)
8. [Quy Ước Loading State](#8-quy-ước-loading-state)
9. [Quy Ước Xử Lý & Hiển Thị Lỗi](#9-quy-ước-xử-lý--hiển-thị-lỗi)
10. [Quy Ước Thông Báo (Toast/Notification)](#10-quy-ước-thông-báo-toastnotification)
11. [Quy Ước Phân Quyền (RBAC) Khi Thêm Trang Mới](#11-quy-ước-phân-quyền-rbac-khi-thêm-trang-mới)
12. [Checklist Trước Khi Merge](#12-checklist-trước-khi-merge)

---

## 1. NGUYÊN TẮC CHUNG

- **Nhất quán hơn "đúng tuyệt đối"**: nếu một pattern đã tồn tại trong code cũ, hãy theo pattern đó thay vì tự sáng tạo cách mới, trừ khi refactor có chủ đích.
- **Tách lớp rõ ràng**: Page (UI) → Hook/Service (logic gọi data) → Supabase Client / Express API (data source). Không gọi `supabase.from(...)` trực tiếp rải rác trong JSX.
- **Không hard-code chuỗi UI lặp lại** (nhãn trạng thái, màu badge, thông báo lỗi) — đưa vào file constants dùng chung.
- **Ưu tiên component nhỏ, tái sử dụng** hơn là 1 file Page khổng lồ xử lý mọi thứ.

---

## 2. CẤU TRÚC THƯ MỤC CHUẨN

```
apps/dashboard/src/
├── assets/
├── components/
│   ├── common/               # Component dùng chung cho mọi Page
│   │   ├── StatusBadge.jsx   # Badge trạng thái (Đã gửi/Chờ gửi/Lỗi)
│   │   ├── DataTable.jsx     # Bảng dữ liệu dùng chung (columns config)
│   │   ├── EmptyState.jsx    # Hiển thị khi không có dữ liệu
│   │   ├── ErrorState.jsx    # Hiển thị lỗi GET + nút "Thử lại" + map error message
│   │   ├── ErrorBoundary.jsx # Bắt lỗi render-time tránh trắng trang
│   │   ├── ConfirmDialog.jsx # Dialog xác nhận trước khi xóa (thay window.confirm)
│   │   └── ConfirmDialog.css
│   ├── Layout.jsx
│   └── Layout.css
├── contexts/
│   ├── AuthContext.jsx        # Xác thực, role, signIn/signOut
│   ├── ToastContext.jsx       # Hệ thống toast chung (success/error/warning/info)
│   └── Toast.css
├── hooks/                     # Custom hooks gọi data
│   ├── useDashboard.js
│   ├── useReminders.js
│   ├── useProducts.js
│   ├── useUsers.js
│   └── useDebounce.js         # Hook debounce dùng chung
├── lib/
│   ├── supabase.js            # Supabase client init
│   └── apiClient.js           # Wrapper gọi Express Admin API (auto JWT, xử lý 401/403)
├── services/                  # Hàm thuần gọi Supabase/API theo domain
│   ├── reminders.service.js
│   ├── products.service.js
│   └── users.service.js
├── constants/                 # Enum trạng thái, message, role
│   ├── status.js              # REMINDER_STATUS, ROLE
│   └── messages.js            # ERROR_MESSAGES, SUCCESS_MESSAGES
├── pages/
│   ├── Dashboard.jsx + .css
│   ├── Reminders.jsx + .css
│   ├── Products.jsx + .css
│   ├── Users.jsx + .css
│   └── Login.jsx + .css
├── App.jsx                    # Routing + ProtectedRoute + ErrorBoundary
├── App.css
├── index.css                  # Design tokens (CSS variables + dark mode)
└── main.jsx
```

**Quy tắc:** Page **không** gọi thẳng `supabase.from()`. Page gọi **hook** → hook gọi **service** → service gọi Supabase/API.

---

## 3. QUY ƯỚC ĐẶT TÊN & CODE STYLE

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Component file | PascalCase | `DataTable.jsx` |
| Hook file/hàm | camelCase, prefix `use` | `useReminders.js` |
| Service file | domain + `.service.js` | `reminders.service.js` |
| CSS file | trùng tên component | `ConfirmDialog.css` |
| Biến/hàm | camelCase | `fetchReminders()` |
| Hằng số/enum | UPPER_SNAKE_CASE | `REMINDER_STATUS.SENT` |
| Props boolean | tiền tố `is`/`has` | `isLoading`, `hasError` |

- Dùng **function component + Hooks**, không dùng class component (ngoại trừ `ErrorBoundary` — bắt buộc dùng class theo React API).
- Ưu tiên **arrow function** cho handler nội bộ component; **named function** cho service/hook export.
- Import order: React/thư viện ngoài → lib/services/hooks nội bộ → components → assets/css.
- Không để `console.log` trong code merge lên `main` (dùng `console.error` có kiểm soát nếu cần).

---

## 4. QUY TRÌNH THÊM MỘT TÍNH NĂNG MỚI

Khi thêm 1 tính năng (ví dụ: thêm trang "Báo cáo doanh thu"), làm theo đúng thứ tự:

1. **Xác định quyền truy cập**: tính năng dành cho Admin/Manager/Staff nào? → cập nhật bảng phân quyền trong `App.jsx`.
2. **Service layer**: tạo `report.service.js` trong `services/`, viết các hàm thuần túy (`getRevenueReport(params)`) — chỉ lo gọi data, trả về `{ data, count, error }`, không chứa logic UI.
3. **Hook layer**: tạo `useRevenueReport.js` trong `hooks/`, dùng service ở bước 2, quản lý `data`, `totalCount`, `loading`, `error` bằng `useState`/`useEffect`.
4. **Constants**: thêm status/message liên quan vào `constants/`.
5. **UI Page**: tạo `pages/Reports.jsx`, chỉ gọi hook, dùng `<DataTable>` cho bảng, `<ErrorState>` cho lỗi, `<EmptyState>` cho trống, `<ConfirmDialog>` cho xóa.
6. **Routing**: thêm `<Route>` trong `App.jsx`, bọc `ProtectedRoute` đúng role.
7. **Sidebar/Navigation**: thêm menu item trong `Layout.jsx`, ẩn/hiện theo role.
8. **Thông báo**: nếu có thao tác tạo/sửa/xóa, dùng `useToast()` theo chuẩn ở mục 9.
9. **Kiểm thử thủ công** với từng role (admin/manager/staff) trước khi merge.

---

## 5. QUY ƯỚC GỌI API (DATA LAYER)

### 5.1. Gọi trực tiếp Supabase (Dashboard, Reminders, Products)
Tất cả nằm trong `services/*.service.js`, theo format thống nhất:

```js
// services/reminders.service.js
import { supabase } from '../lib/supabase';

export async function getReminders({ statusFilter, searchTerm, page, pageSize }) {
  let query = supabase.from('reminders').select('*', { count: 'exact' });

  if (statusFilter === 'sent') query = query.eq('sent', true);
  if (searchTerm?.trim()) {
    query = query.or(
      `customer_name.ilike.%${searchTerm.trim()}%,invoice_code.ilike.%${searchTerm.trim()}%`
    );
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  return { data: data || [], count: count || 0, error };
}
```

Hook tương ứng:

```js
// hooks/useReminders.js
import { useState, useEffect, useCallback } from 'react';
import { getReminders } from '../services/reminders.service';

export function useReminders(filters) {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, count, error } = await getReminders(filters);
    if (error) setError(error);
    else {
      setData(data);
      setTotalCount(count);
    }
    setLoading(false);
  }, [filters.page, filters.statusFilter, filters.searchTerm, filters.pageSize]);

  useEffect(() => { load(); }, [load]);

  return { data, totalCount, loading, error, refetch: load };
}
```

### 5.2. Gọi Express Admin API (chỉ trang Users)
Dùng chung 1 wrapper `lib/apiClient.js` để tự động đính JWT, xử lý lỗi HTTP nhất quán:

```js
// lib/apiClient.js
import { supabase } from './supabase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456';
const API_PREFIX = '/api';

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
  }

  const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    // Tự động đăng xuất khi token hết hạn hoặc không có quyền
    if (res.status === 401 || res.status === 403) {
      await supabase.auth.signOut();
      throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }
    throw new Error(json?.error || json?.message || 'Đã có lỗi xảy ra khi gọi API.');
  }
  return json;
}
```

**Quy tắc bắt buộc:**
- Mọi hàm service **luôn trả về** `{ data, count, error }` (Supabase) hoặc **throw Error có message tiếng Việt rõ ràng** (Express API) — không để lỗi kỹ thuật sống sượng hiển thị ra UI.
- Không gọi `fetch`/`supabase` trực tiếp trong component.
- Tên hàm service theo động từ: `getX`, `createX`, `updateX`, `deleteX`.
- **Luôn dùng phân trang** với `select('*', { count: 'exact' })` + `.range()` — không `select('*')` không giới hạn.
- `apiClient.js` tự động xử lý 401/403 → gọi `supabase.auth.signOut()` để đăng xuất.

---

## 6. QUY ƯỚC TÌM KIẾM (SEARCH PATTERN)

### Nguyên tắc bắt buộc
- Tìm kiếm **luôn là server-side** — query Supabase với filter, không filter trên mảng client.
- Luôn dùng `useDebounce` để tránh spam request mỗi ký tự gõ.
- Khi user gõ từ khóa mới, **reset về trang 0** để tránh hiển thị trang trống.

### Pattern chuẩn (áp dụng cho Products, Reminders):

**1. Hook `useDebounce` (hooks/useDebounce.js)**
```js
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**2. Trong Page component**
```jsx
const [searchTerm, setSearchTerm] = useState('');       // giá trị input hiển thị
const [page, setPage] = useState(0);
const debouncedSearch = useDebounce(searchTerm, 300);   // chờ 300ms sau khi ngừng gõ

const { products } = useProducts({
  page,
  pageSize: PAGE_SIZE,
  search: debouncedSearch,   // chỉ truyền debouncedSearch, KHÔNG truyền searchTerm
});

// Handler: reset trang khi thay đổi từ khóa
onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
```

**3. Trong Service (Supabase)**
```js
export async function getProducts({ page = 0, pageSize = 20, search = '' } = {}) {
  let query = supabase
    .from('oil_products')
    .select('*', { count: 'exact' })
    .order('product_name', { ascending: true });

  if (search.trim()) {
    query = query.ilike('product_name', `%${search.trim()}%`);
  }

  query = query.range(page * pageSize, (page + 1) * pageSize - 1);
  const { data, count, error } = await query;
  return { data: data || [], count: count || 0, error };
}
```

**4. Trong Hook — thêm `search` vào dependency**
```js
const load = useCallback(async () => {
  // ...
}, [filters.page, filters.pageSize, filters.search]); // search phải có trong deps
```

### Vì sao không filter client-side?
- Client chỉ có 15 sản phẩm của trang hiện tại — tìm theo trang = bỏ sót dữ liệu ở trang khác.
- `ilike '%keyword%'` với Supabase quét toàn bảng, trả về đúng `count` → phân trang chính xác.

---

## 7. QUY ƯỚC GIAO DIỆN (UI COMPONENTS)

- Toàn bộ màu sắc, spacing, font lấy từ **Design Token** khai báo tại `index.css` (biến CSS `--accent-primary`, `--danger`, `--text-secondary`...). Không hard-code mã màu hex trong file CSS hoặc inline style của component.
- Component dùng chung đặt trong `components/common/`, tái sử dụng cho mọi Page thay vì viết lại.

### Danh sách component dùng chung hiện có:

| Component | Props chính | Mô tả |
|---|---|---|
| `<StatusBadge>` | `sent`, `error` | Badge trạng thái (Đã gửi / Chờ gửi / Lỗi) |
| `<DataTable>` | `columns`, `rows`, `loading`, `emptyMessage`, `rowKey` | Bảng dữ liệu dùng chung, tự xử lý loading + empty |
| `<EmptyState>` | `icon`, `message`, `description`, `action` | Hiển thị khi không có dữ liệu |
| `<ErrorState>` | `message`, `onRetry` | Hiển thị lỗi GET + nút "Thử lại", tự map error message qua `messages.js` |
| `<ErrorBoundary>` | `children` | Bọc routes, bắt lỗi render-time, hiển thị fallback + nút tải lại |
| `<ConfirmDialog>` | `open`, `title`, `message`, `confirmText`, `cancelText`, `danger`, `loading`, `onConfirm`, `onCancel` | Dialog xác nhận trước hành động nguy hiểm (xóa) |

### Cách dùng `<DataTable>`:

```jsx
const columns = [
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', render: (row) => <RoleSelect value={row.role} /> },
  { key: 'created_at', label: 'Ngày tạo', render: (row) => formatDate(row.created_at) },
  { key: 'actions', label: 'Thao tác', render: (row) => <ActionButtons row={row} /> },
];

<DataTable columns={columns} rows={users} loading={loading} emptyMessage="Chưa có người dùng" />
```

### Cách dùng `<ConfirmDialog>` (thay `window.confirm()`):

```jsx
const [confirmDelete, setConfirmDelete] = useState(null);
const [isDeleting, setIsDeleting] = useState(false);

const handleDeleteConfirm = async () => {
  setIsDeleting(true);
  const { error } = await deleteItem(confirmDelete);
  setIsDeleting(false);
  setConfirmDelete(null);
  if (error) toast.error('Lỗi khi xoá.');
  else toast.success('Đã xoá thành công.');
};

// Trigger: onClick={() => setConfirmDelete(itemId)}
<ConfirmDialog
  open={confirmDelete !== null}
  title="Xác nhận xoá"
  message="Bạn có chắc chắn muốn xoá?"
  confirmText="Xoá"
  loading={isDeleting}
  onConfirm={handleDeleteConfirm}
  onCancel={() => setConfirmDelete(null)}
/>
```

> ⚠️ **KHÔNG dùng `window.confirm()`** — luôn dùng `<ConfirmDialog />` để giao diện nhất quán và hỗ trợ loading state.

---

## 8. QUY ƯỚC LOADING STATE

Áp dụng thống nhất 3 cấp độ loading:

| Cấp độ | Khi nào dùng | Cách hiển thị |
|---|---|---|
| **Page loading** | Lần đầu vào trang, chưa có data | `<DataTable loading={true} />` hoặc `<Loader2>` full khu vực nội dung |
| **Action loading** | Đang submit form / xóa / cập nhật | Disable nút bấm + text "Đang xử lý..." (`saving`, `isDeleting`) |
| **Refetch loading** | Đổi filter/search khi đã có data cũ | Giữ data cũ hiển thị mờ (`opacity: 0.5`) thay vì xóa trắng bảng |

- Biến state loading đặt tên rõ mục đích: `loading` (load trang), `saving` (đang submit), `isDeleting` (đang xóa) — tránh dùng 1 biến `loading` chung cho mọi hành động khiến cả trang bị khoá khi chỉ 1 dòng đang xử lý.
- Luôn có `finally { setLoading(false) }` để tránh loading treo vĩnh viễn khi lỗi.

---

## 9. QUY ƯỚC XỬ LÝ & HIỂN THỊ LỖI

### 8.1. ErrorBoundary (lỗi render-time)
- `<ErrorBoundary>` bọc `<AppRoutes />` trong `App.jsx`.
- Bắt lỗi render không mong muốn, hiển thị fallback UI + nút "Tải lại trang".
- Tránh trắng trang toàn bộ khi 1 component lỗi.

### 8.2. ErrorState (lỗi API GET)
- Dùng `<ErrorState message={error.message} onRetry={refetch} />` trong mọi page.
- Component tự động map error message kỹ thuật → message tiếng Việt thân thiện:

| Error chứa | Map sang |
|---|---|
| `duplicate`, `already exists`, `unique` | `ERROR_MESSAGES.DUPLICATE` |
| `network`, `fetch`, `failed to fetch` | `ERROR_MESSAGES.NETWORK` |
| `unauthorized`, `401`, `403` | `ERROR_MESSAGES.UNAUTHORIZED` |
| Tiếng Việt (từ code nội bộ) | Giữ nguyên |
| Mặc định | `ERROR_MESSAGES.DEFAULT` |

### 8.3. Lỗi thao tác (POST/PUT/DELETE)
- Hiển thị bằng **toast lỗi** (mục 9), form vẫn giữ nguyên dữ liệu người dùng đã nhập.

### 8.4. Lỗi validate form
- Hiển thị ngay dưới field liên quan, tiếng Việt, không dùng `alert()`.

### 8.5. Lỗi 401/403 từ Express API
- `apiClient.js` tự động gọi `supabase.auth.signOut()` → trigger `onAuthStateChange` trong `AuthContext` → redirect về `/login`.

```js
// constants/messages.js
export const ERROR_MESSAGES = {
  DUPLICATE: 'Dữ liệu đã tồn tại trong hệ thống.',
  NETWORK: 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng.',
  UNAUTHORIZED: 'Bạn không có quyền thực hiện thao tác này.',
  DEFAULT: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
};

export const SUCCESS_MESSAGES = {
  SAVED: 'Đã lưu thành công.',
  DELETED: 'Đã xoá thành công.',
  CREATED: 'Đã tạo thành công.',
};
```

---

## 10. QUY ƯỚC THÔNG BÁO (TOAST/NOTIFICATION)

- Dùng hệ thống toast chung qua `ToastContext`, gọi qua hook `useToast()`:

```js
const toast = useToast();
toast.success('Đã lưu lịch nhắc nhở thành công.');
toast.error('Không thể xóa sản phẩm này.');
toast.warning('Dữ liệu chưa được lưu.');
toast.info('Đang đồng bộ dữ liệu...');
```

| Loại | Khi dùng | Thời gian hiển thị |
|---|---|---|
| `success` | Tạo/sửa/xóa thành công | 3s tự ẩn |
| `error` | Thao tác thất bại | 5s hoặc tới khi người dùng đóng |
| `warning` | Cảnh báo (VD: dữ liệu chưa lưu, sắp hết hạn) | 5s hoặc tới khi người dùng đóng |
| `info` | Thông tin trung tính | 3s tự ẩn |

- Hành động **xóa (delete)** luôn có `<ConfirmDialog />` xác nhận trước, sau khi xác nhận mới gọi service + hiện toast kết quả.
- Không lạm dụng toast cho lỗi validate field-level (dùng inline error thay vì toast).

---

## 11. QUY ƯỚC PHÂN QUYỀN (RBAC) KHI THÊM TRANG MỚI

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

## 12. CHECKLIST TRƯỚC KHI MERGE

- [ ] Không gọi `supabase`/`fetch` trực tiếp trong file `pages/*`.
- [ ] Có xử lý đủ 4 trạng thái: loading / error / empty / có dữ liệu.
- [ ] Dùng `<DataTable>` cho bảng, `<EmptyState>` cho trống, `<ErrorState>` cho lỗi GET.
- [ ] Dùng `<ConfirmDialog>` cho hành động xóa, **KHÔNG** dùng `window.confirm()`.
- [ ] Toast thông báo cho mọi thao tác tạo/sửa/xóa (dùng `useToast()`).
- [ ] Route mới đã bọc `ProtectedRoute` đúng role.
- [ ] Không hard-code màu sắc — dùng design token ở `index.css`.
- [ ] Không còn `console.log` thừa.
- [ ] Message lỗi hiển thị cho người dùng là tiếng Việt, thân thiện, không lộ lỗi kỹ thuật.
- [ ] Service query dùng phân trang (`select('*', { count: 'exact' })` + `.range()`).
- [ ] Ô tìm kiếm dùng `useDebounce` (300ms) + truyền `search` xuống service để query server-side — không filter client-side trên trang hiện tại.
- [ ] Pagination ẩn khi không có dữ liệu (`filteredProducts.length > 0 && totalPages > 1`).
