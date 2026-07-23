import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Users as UsersIcon,
  Loader2,
  RefreshCw,
  Trash2,
  UserPlus,
  KeyRound,
  Shield
} from 'lucide-react';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('staff');
  
  const [resetUserId, setResetUserId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const getApiHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    };
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = await getApiHeaders();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';
      const res = await fetch(`${apiUrl}/users`, { headers });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Lỗi khi tải danh sách người dùng');
      }
      
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;
    
    try {
      setSaving(true);
      const headers = await getApiHeaders();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';
      const res = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Lỗi tạo người dùng');
      }
      
      setShowCreateForm(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('staff');
      fetchUsers();
      alert('Tạo người dùng thành công!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPassword || !resetUserId) return;
    
    try {
      setSaving(true);
      const headers = await getApiHeaders();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';
      const res = await fetch(`${apiUrl}/users/${resetUserId}/password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ password: resetPassword })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Lỗi đổi mật khẩu');
      }
      
      setResetUserId(null);
      setResetPassword('');
      alert('Đổi mật khẩu thành công!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      const headers = await getApiHeaders();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';
      const res = await fetch(`${apiUrl}/users/${userId}/role`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Lỗi đổi role');
      }
      
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá người dùng ${email}? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const headers = await getApiHeaders();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';
      const res = await fetch(`${apiUrl}/users/${userId}`, {
        method: 'DELETE',
        headers
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Lỗi xoá người dùng');
      }
      
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="users-page">
      <div className="users-header glass-card">
        <div className="users-title">
          <UsersIcon size={22} />
          <h2>Quản lý người dùng</h2>
        </div>

        <div className="users-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            <UserPlus size={16} />
            {showCreateForm ? 'Huỷ tạo mới' : 'Tạo người dùng'}
          </button>
          <button className="btn btn-secondary" onClick={fetchUsers}>
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="create-user-form glass-card animate-fade-in">
          <h3>Tạo người dùng mới</h3>
          <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                className="input-field" 
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input 
                type="password" 
                className="input-field" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select className="input-field" value={newRole} onChange={e => setNewRole(e.target.value)}>
                <option value="staff">Staff (Nhân viên)</option>
                <option value="manager">Manager (Quản lý)</option>
                <option value="admin">Admin (Quản trị)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang tạo...' : 'Lưu người dùng'}
            </button>
          </form>
        </div>
      )}

      {resetUserId && (
        <div className="create-user-form glass-card animate-fade-in">
          <h3>Đổi mật khẩu cho user</h3>
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input 
                type="password" 
                className="input-field" 
                value={resetPassword} 
                onChange={e => setResetPassword(e.target.value)} 
                required 
                minLength={6}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu mật khẩu'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setResetUserId(null)}>
                Huỷ
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="alert-error glass-card">
          {error}
        </div>
      )}

      <div className="users-table-container glass-card">
        {loading ? (
          <div className="loading-container">
            <Loader2 size={32} className="animate-spin" />
            <p>Đang tải danh sách...</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <select 
                      className={`role-select ${u.role}`}
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                    >
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon" 
                        title="Đổi mật khẩu"
                        onClick={() => {
                          setResetUserId(u.id);
                          setResetPassword('');
                          setShowCreateForm(false);
                        }}
                      >
                        <KeyRound size={16} />
                      </button>
                      <button 
                        className="btn-icon-danger" 
                        title="Xoá user"
                        onClick={() => handleDeleteUser(u.id, u.email)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;
