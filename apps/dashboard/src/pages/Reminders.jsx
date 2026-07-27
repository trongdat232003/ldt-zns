import React, { useState } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useReminders } from '../hooks/useReminders';
import { StatusBadge } from '../components/common/StatusBadge';
import { ErrorState } from '../components/common/ErrorState';
import { DataTable } from '../components/common/DataTable';
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

  const columns = [
    { key: 'invoice_code', label: 'Mã hoá đơn', className: 'code-cell' },
    { key: 'customer_name', label: 'Khách hàng', className: 'customer-name' },
    {
      key: 'customer_code',
      label: 'Mã KH',
      className: 'code-cell',
      render: (r) => r.customer_code || '—',
    },
    {
      key: 'purchase_date',
      label: 'Ngày mua',
      render: (r) => r.purchase_date ? new Date(r.purchase_date).toLocaleDateString('vi-VN') : '—',
    },
    {
      key: 'due_date',
      label: 'Ngày nhắc',
      render: (r) => r.due_date ? new Date(r.due_date).toLocaleDateString('vi-VN') : '—',
    },
    {
      key: 'phone',
      label: 'SĐT',
      render: (r) => r.phone || '—',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (r) => <StatusBadge sent={r.sent} error={r.error} />,
    },
    {
      key: 'sent_at',
      label: 'Thời gian gửi',
      render: (r) => r.sent_at ? new Date(r.sent_at).toLocaleString('vi-VN') : '—',
    },
  ];

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
        <ErrorState message={error.message} onRetry={refetch} />
      )}

      {/* Table */}
      <div className="reminders-table-card glass-card">
        <div className="table-info">
          <span>Hiển thị {reminders.length} / {totalCount} nhắc nhở</span>
        </div>

        <DataTable
          columns={columns}
          rows={reminders}
          loading={loading}
          emptyMessage="Không tìm thấy dữ liệu phù hợp"
          rowKey={(r) => r.id || r.invoice_code}
          loadingText="Đang tải..."
        />

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
      </div>
    </div>
  );
};

export default Reminders;
