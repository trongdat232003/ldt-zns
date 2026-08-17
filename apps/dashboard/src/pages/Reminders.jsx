import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
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
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(REMINDER_STATUS.ALL);
  const [searchInput, setSearchInput] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const { data: reminders, totalCount, loading, error, refetch } = useReminders({
    page,
    pageSize: PAGE_SIZE,
    statusFilter,
    searchTerm,
    purchaseDate,
    dueDate,
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
      render: (r) => <StatusBadge sent={r.sent} cancelled={r.cancelled} error={r.error} />,
    },
    {
      key: 'note',
      label: 'Ghi chú',
      className: 'note-cell',
      render: (r) => (
        <span className={`reminder-note-text ${r.note ? 'has-note' : ''}`} title={r.note || ''}>
          {r.note || '—'}
        </span>
      ),
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
            placeholder="Tìm kiếm khách hàng, mã hoá đơn, ghi chú..."
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
            <option value={REMINDER_STATUS.PENDING}>Chờ gửi</option>
            <option value={REMINDER_STATUS.SENT}>Đã gửi</option>
            <option value={REMINDER_STATUS.CANCELLED}>Đã huỷ</option>
            <option value={REMINDER_STATUS.FAILED}>Lỗi</option>
          </select>
        </div>

        <label className="date-filter">
          <span className="date-filter-label">
            <Calendar size={16} />
            Ngày mua
          </span>
          <input
            type="date"
            className="input-field date-input"
            value={purchaseDate}
            onChange={(e) => { setPurchaseDate(e.target.value); setPage(0); }}
          />
        </label>

        <label className="date-filter">
          <span className="date-filter-label">
            <Calendar size={16} />
            Ngày nhắc
          </span>
          <input
            type="date"
            className="input-field date-input"
            value={dueDate}
            onChange={(e) => { setDueDate(e.target.value); setPage(0); }}
          />
        </label>

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
          onRowClick={(reminder) => navigate(`/reminders/${reminder.invoice_code}`)}
          rowClassName={(r) => r.cancelled ? 'row-cancelled' : ''}
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
