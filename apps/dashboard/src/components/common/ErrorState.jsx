import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ERROR_MESSAGES } from '../../constants/messages';

/**
 * Map raw error message to user-friendly Vietnamese message.
 * Avoids exposing technical details (Supabase/Postgres errors) to end users.
 */
function mapErrorMessage(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return ERROR_MESSAGES.DEFAULT;
  }

  const lower = rawMessage.toLowerCase();

  if (lower.includes('duplicate') || lower.includes('already exists') || lower.includes('unique')) {
    return ERROR_MESSAGES.DUPLICATE;
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch') || lower.includes('kết nối')) {
    return ERROR_MESSAGES.NETWORK;
  }
  if (lower.includes('unauthorized') || lower.includes('403') || lower.includes('401') || lower.includes('không có quyền')) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }

  // If the message is already in Vietnamese (from our own code), pass it through
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(rawMessage)) {
    return rawMessage;
  }

  return ERROR_MESSAGES.DEFAULT;
}

export const ErrorState = ({ message, onRetry }) => {
  const displayMessage = mapErrorMessage(message);

  return (
    <div className="error-state" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      minHeight: '200px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--danger)',
      }}>
        <AlertTriangle size={24} />
      </div>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        maxWidth: '400px',
        lineHeight: '1.5',
      }}>
        {displayMessage}
      </p>
      {onRetry && (
        <button
          className="btn btn-secondary"
          onClick={onRetry}
          style={{ marginTop: '0.5rem' }}
        >
          <RefreshCw size={16} />
          Thử lại
        </button>
      )}
    </div>
  );
};
