import React from 'react';
import { 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Calendar,
  Users,
  Loader2
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { StatusBadge } from '../components/common/StatusBadge';
import './Dashboard.css';

const Dashboard = () => {
  const { stats, recentReminders, loading, error } = useDashboard();

  const statCards = [
    {
      label: 'Tổng nhắc nhở',
      value: stats.totalReminders,
      icon: <Users size={22} />,
      color: 'var(--accent-primary)',
      bgColor: 'var(--accent-light)',
    },
    {
      label: 'Đã gửi hôm nay',
      value: stats.sentToday,
      icon: <Send size={22} />,
      color: 'var(--success)',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Đang chờ gửi',
      value: stats.pending,
      icon: <Clock size={22} />,
      color: 'var(--warning)',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Gửi lỗi',
      value: stats.failed,
      icon: <AlertTriangle size={22} />,
      color: 'var(--danger)',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 size={40} className="animate-spin" />
        <p>Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="alert alert-danger" style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
          Có lỗi xảy ra khi tải dữ liệu: {error.message || error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Tổng quan hệ thống
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Số liệu thống kê tự động cập nhật từ hệ thống KiotViet & ZNS
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, idx) => (
          <div 
            key={idx} 
            className="stat-card glass-card"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="recent-card glass-card">
          <div className="card-header">
            <h3><Calendar size={18} /> Giao dịch gần đây</h3>
            <button className="btn-text">Xem tất cả</button>
          </div>
          
          <div className="recent-list">
            {recentReminders.length === 0 ? (
              <div className="empty-state">
                Chưa có dữ liệu giao dịch
              </div>
            ) : (
              recentReminders.map((reminder, idx) => (
                <div key={reminder.id} className="recent-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="recent-item-info">
                    <div className="recent-avatar">
                      {reminder.customer_name?.charAt(0) || 'K'}
                    </div>
                    <div>
                      <h4>{reminder.customer_name}</h4>
                      <p>{reminder.invoice_code} • {reminder.phone}</p>
                    </div>
                  </div>
                  <div className="recent-item-status">
                    <span className="date-text">
                      {reminder.purchase_date ? new Date(reminder.purchase_date).toLocaleDateString('vi-VN') : ''}
                    </span>
                    <StatusBadge sent={reminder.sent} error={reminder.error} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="card-header">
            <h3><TrendingUp size={18} /> Hiệu suất gửi tin</h3>
          </div>
          <div className="chart-placeholder">
            <div className="performance-circle">
              <span className="percentage">
                {stats.totalReminders > 0 
                  ? Math.round((stats.sentToday / stats.totalReminders) * 100) 
                  : 0}%
              </span>
              <span className="label">Tỷ lệ thành công hôm nay</span>
            </div>
            
            <div className="performance-stats">
              <div className="perf-item">
                <div className="perf-dot" style={{ background: 'var(--success)' }}></div>
                <span>Thành công ({stats.sentToday})</span>
              </div>
              <div className="perf-item">
                <div className="perf-dot" style={{ background: 'var(--warning)' }}></div>
                <span>Chờ gửi ({stats.pending})</span>
              </div>
              <div className="perf-item">
                <div className="perf-dot" style={{ background: 'var(--danger)' }}></div>
                <span>Lỗi ({stats.failed})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
