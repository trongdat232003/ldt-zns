import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BellRing, 
  Package, 
  LogOut,
  User
} from 'lucide-react';
import './Layout.css';
import logoImg from '../assets/LOGO LTĐ_ nền sáng-01.png';

const Layout = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <img src={logoImg} alt="LTĐ Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h2>Hệ thống gửi tin nhắn<br/>nhắc nhở</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard size={20} />
            <span>Tổng quan</span>
          </NavLink>
          
          <NavLink to="/reminders" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <BellRing size={20} />
            <span>Lịch nhắc nhở</span>
          </NavLink>

          {(role === 'admin' || role === 'manager') && (
            <div className="nav-group">
              <div className="nav-item-header">
                <Package size={20} />
                <span>Sản phẩm</span>
              </div>
              <div className="nav-sub-items">
                <NavLink 
                  to="/products" 
                  end
                  className={() => location.pathname === '/products' && (!location.search || location.search === '?tab=oil') ? 'nav-sub-item active' : 'nav-sub-item'}
                >
                  Sản phẩm nhớt
                </NavLink>
                <NavLink 
                  to="/products?tab=other" 
                  className={() => location.pathname === '/products' && location.search === '?tab=other' ? 'nav-sub-item active' : 'nav-sub-item'}
                >
                  Sản phẩm khác
                </NavLink>
              </div>
            </div>
          )}

          {role === 'admin' && (
            <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <User size={20} />
              <span>Người dùng</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">
              <User size={18} />
            </div>
            <div className="user-details">
              <span className="email" title={user?.email}>{user?.email}</span>
              <span className={`role badge ${role === 'admin' ? 'badge-warning' : 'badge-success'}`}>
                {role || 'staff'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout" title="Đăng xuất">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header glass">
          <div className="header-title">
            <h1>Dashboard</h1>
          </div>
          <div className="header-actions">
            <div className="status-indicator">
              <span className="dot pulse"></span>
              <span>Hệ thống đang hoạt động</span>
            </div>
          </div>
        </header>
        
        <div className="content-area animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
