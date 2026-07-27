import React from 'react';
import { Loader2 } from 'lucide-react';
import { EmptyState } from './EmptyState';

/**
 * DataTable — component bảng dữ liệu dùng chung cho Reminders, Users, v.v.
 * Xử lý loading, empty, và render data theo columns config.
 *
 * Props:
 *   columns     - array of { key, label, render? }
 *                  key: trường dữ liệu hoặc identifier
 *                  label: tiêu đề cột
 *                  render: (row, index) => ReactNode (optional, custom render)
 *   rows        - array of data objects
 *   loading     - boolean
 *   emptyMessage - string (mặc định "Không tìm thấy dữ liệu phù hợp")
 *   emptyIcon   - React node (optional)
 *   rowKey      - string | function: key cho mỗi row (mặc định 'id')
 *   loadingText - string (mặc định "Đang tải...")
 */
export const DataTable = ({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = 'Không tìm thấy dữ liệu phù hợp',
  emptyIcon,
  rowKey = 'id',
  loadingText = 'Đang tải...',
}) => {
  const getRowKey = (row, index) => {
    if (typeof rowKey === 'function') return rowKey(row, index);
    return row[rowKey] ?? index;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 size={32} className="animate-spin" />
        <p>{loadingText}</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-row">
                <EmptyState
                  icon={emptyIcon}
                  message={emptyMessage}
                />
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={getRowKey(row, index)}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className || ''}>
                    {col.render
                      ? col.render(row, index)
                      : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
