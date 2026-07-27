import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState — component hiển thị khi không có dữ liệu.
 * Dùng chung cho tất cả pages thay vì mỗi trang viết inline khác nhau.
 *
 * Props:
 *   icon       - React node: icon tùy chỉnh (mặc định Inbox)
 *   message    - string: thông báo chính (mặc định "Không có dữ liệu")
 *   description - string: mô tả phụ (optional)
 *   action     - React node: nút hành động (optional, ví dụ "Thêm mới")
 */
export const EmptyState = ({
  icon,
  message = 'Không có dữ liệu',
  description,
  action,
}) => {
  return (
    <div className="empty-state-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '3rem 1.5rem',
      textAlign: 'center',
      minHeight: '200px',
    }}>
      <div style={{
        color: 'var(--text-secondary)',
        opacity: 0.4,
        marginBottom: '0.25rem',
      }}>
        {icon || <Inbox size={48} />}
      </div>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontWeight: 500,
      }}>
        {message}
      </p>
      {description && (
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
          opacity: 0.7,
          maxWidth: '320px',
        }}>
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: '0.5rem' }}>
          {action}
        </div>
      )}
    </div>
  );
};
