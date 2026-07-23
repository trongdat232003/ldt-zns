import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { REMINDER_STATUS } from '../../constants/status';

export const StatusBadge = ({ sent, error }) => {
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
