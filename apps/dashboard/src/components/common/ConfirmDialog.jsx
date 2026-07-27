import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDialog.css';

/**
 * ConfirmDialog — modal xác nhận trước khi thực hiện hành động nguy hiểm (xóa, etc.)
 * Thay thế window.confirm() theo CODING_STANDARDS.md mục 9.
 * 
 * Props:
 *   open       - boolean: hiển thị dialog
 *   title      - string: tiêu đề (mặc định "Xác nhận")
 *   message    - string: nội dung câu hỏi
 *   confirmText - string: text nút xác nhận (mặc định "Xác nhận")
 *   cancelText  - string: text nút hủy (mặc định "Huỷ")
 *   danger     - boolean: nút xác nhận màu đỏ (mặc định true)
 *   loading    - boolean: đang xử lý
 *   onConfirm  - function: callback khi xác nhận
 *   onCancel   - function: callback khi hủy
 */
export const ConfirmDialog = ({
  open,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Huỷ',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog glass-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-header">
          {danger && (
            <div className="confirm-icon-wrapper">
              <AlertTriangle size={22} />
            </div>
          )}
          <h3 className="confirm-title">{title}</h3>
          <button className="confirm-close-btn" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
