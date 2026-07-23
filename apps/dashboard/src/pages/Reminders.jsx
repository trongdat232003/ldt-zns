import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import './Reminders.css';

const PAGE_SIZE = 15;

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, sent, pending, failed

  useEffect(() => {
    fetchReminders();
  }, [page, statusFilter]);

  const fetchReminders = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('reminders')
        .select('*', { count: 'exact' });

      // Apply status filter
      if (statusFilter === 'sent') {
        query = query.eq('sent', true);
      } else if (statusFilter === 'pending') {
        query = query.eq('sent', false);
      } else if (statusFilter === 'failed') {
        query = query.eq('sent', false).eq('id', -1);
      }

      // Apply search
      if (searchTerm.trim()) {
        query = query.or(`customer_name.ilike.%${searchTerm}%,invoice_code.ilike.%${searchTerm}%`);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      setReminders(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchReminders();
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const getStatusBadge = (reminder) => {
    if (reminder.sent) {
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={12} /> Đã gửi
        </span>
      );
    }
    if (reminder.error) {
      return (
        <span className="badge badge-danger" title={reminder.error}>
          <AlertTriangle size={12} /> Lỗi
        </span>
      );
    }
    return (
      <span className="badge badge-warning">
        <Clock size={12} /> Chờ gửi
      </span>
    );
  };

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <Filter size={16} />
          <select
            className="input-field filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value="all">Tất cả</option>
            <option value="sent">Đã gửi</option>
            <option value="pending">Chờ gửi</option>
            <option value="failed">Lỗi</option>
          </select>
        </div>

        <button className="btn btn-secondary" onClick={fetchReminders}>
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

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
                        <td>{getStatusBadge(r)}</td>
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
