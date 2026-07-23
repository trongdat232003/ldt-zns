import React, { useState } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useReminders } from '../hooks/useReminders';
import { StatusBadge } from '../components/common/StatusBadge';
import { REMINDER_STATUS } from '../constants/status';
import './Reminders.css';

const PAGE_SIZE = 15;

const Reminders = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(REMINDER_STATUS.ALL);
  const [searchInput, setSearchInput] = useState('');

  const { data: reminders, totalCount, loading, error, refetch } = useReminders({
    page,
    pageSize: PAGE_SIZE,
    statusFilter,
    searchTerm
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearchTerm(searchInput);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="reminders-page">
      {/* Filters Bar */}
      <div className="filters-bar glass-card">
        <form className="search-box" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng, mã hoá đơn..."
            className="input-field search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <Filter size={16} />
          <select
            className="input-field filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value={REMINDER_STATUS.ALL}>Tất cả</option>
            <option value={REMINDER_STATUS.SENT}>Đã gửi</option>
            <option value={REMINDER_STATUS.PENDING}>Chờ gửi</option>
            <option value={REMINDER_STATUS.FAILED}>Lỗi</option>
          </select>
        </div>

        <button className="btn btn-secondary" onClick={refetch}>
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
          Có lỗi xảy ra: {error.message}
        </div>
      )}

      {/* Table */}
      <div className="reminders-table-card glass-card">
        {loading ? (
          <div className="loading-container">
            <Loader2 size={32} className="animate-spin" />
            <p>Đang tải...</p>
          </div>
        ) : (
          <>
            <div className="table-info">
              <span>Hiển thị {reminders.length} / {totalCount} nhắc nhở</span>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã hoá đơn</th>
                    <th>Khách hàng</th>
                    <th>Mã KH</th>
                    <th>Ngày mua</th>
                    <th>Ngày nhắc</th>
                    <th>SĐT</th>
                    <th>Trạng thái</th>
                    <th>Thời gian gửi</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-row">
                        Không tìm thấy dữ liệu phù hợp
                      </td>
                    </tr>
                  ) : (
                    reminders.map((r) => (
                      <tr key={r.id || r.invoice_code}>
                        <td className="code-cell">{r.invoice_code}</td>
                        <td className="customer-name">{r.customer_name}</td>
                        <td className="code-cell">{r.customer_code || '—'}</td>
                        <td>{r.purchase_date ? new Date(r.purchase_date).toLocaleDateString('vi-VN') : '—'}</td>
                        <td>{r.due_date ? new Date(r.due_date).toLocaleDateString('vi-VN') : '—'}</td>
                        <td>{r.phone || '—'}</td>
                        <td><StatusBadge sent={r.sent} error={r.error} /></td>
                        <td>{r.sent_at ? new Date(r.sent_at).toLocaleString('vi-VN') : '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary pagination-btn"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft size={16} /> Trước
                </button>
                <span className="page-info">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  className="btn btn-secondary pagination-btn"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  Sau <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reminders;
