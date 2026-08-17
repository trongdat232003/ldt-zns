import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Ban } from 'lucide-react';

export const StatusBadge = ({ sent, cancelled, error }) => {
  if (cancelled) {
    return (
      <span className="badge badge-cancelled">
        <Ban size={12} /> Đã huỷ
      </span>
    );
  }
  if (sent) {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={12} /> Đã gửi
      </span>
    );
  }
  if (error) {
    return (
      <span className="badge badge-danger" title={error}>
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
