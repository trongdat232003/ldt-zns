import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReminders: 0,
    sentToday: 0,
    pending: 0,
    failed: 0,
  });
  const [recentReminders, setRecentReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Total reminders
      const { count: totalReminders } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true });

      // Sent today
      const { count: sentToday } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('sent', true)
        .gte('sent_at', `${today}T00:00:00`);

      // Pending (not sent, due today or before)
      const { count: pending } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('sent', false)
        .lte('due_date', today);

      // Failed (has error) - set 0 as error column does not exist in table
      const failed = 0;

      setStats({
        totalReminders: totalReminders || 0,
        sentToday: sentToday || 0,
        pending: pending || 0,
        failed: failed || 0,
      });

      // Recent reminders
      const { data: recent } = await supabase
        .from('reminders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      setRecentReminders(recent || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

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
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 size={40} className="animate-spin" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Stat Cards */}
      <div className="stat-cards">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="stat-card glass-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="stat-card-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-card-info">
              <span className="stat-value">{card.value.toLocaleString('vi-VN')}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reminders Table */}
      <div className="section glass-card">
        <div className="section-header">
          <div className="section-title">
            <Calendar size={20} />
            <h2>Nhắc nhở gần đây</h2>
          </div>
          <button className="btn btn-secondary" onClick={fetchDashboardData}>
            <TrendingUp size={16} />
            Làm mới
          </button>
        </div>
        
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã hoá đơn</th>
                <th>Khách hàng</th>
                <th>Ngày mua</th>
                <th>Ngày nhắc</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentReminders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Chưa có dữ liệu nhắc nhở
                  </td>
                </tr>
              ) : (
                recentReminders.map((r) => (
                  <tr key={r.id || r.invoice_code}>
                    <td className="code-cell">{r.invoice_code}</td>
                    <td>{r.customer_name}</td>
                    <td>{r.purchase_date ? new Date(r.purchase_date).toLocaleDateString('vi-VN') : '—'}</td>
                    <td>{r.due_date ? new Date(r.due_date).toLocaleDateString('vi-VN') : '—'}</td>
                    <td>
                      {r.sent ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Đã gửi
                        </span>
                      ) : r.error ? (
                        <span className="badge badge-danger">
                          <AlertTriangle size={12} /> Lỗi
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <Clock size={12} /> Chờ gửi
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
