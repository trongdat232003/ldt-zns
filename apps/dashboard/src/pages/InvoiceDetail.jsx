import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Mail,
  FileText,
  Package,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle,
  Building2,
  Hash,
  Bell,
  StickyNote,
} from 'lucide-react';
import { useInvoiceDetail } from '../hooks/useInvoiceDetail';
import { StatusBadge } from '../components/common/StatusBadge';
import { ErrorState } from '../components/common/ErrorState';
import { getPaymentMethodLabel } from '../constants/payment';
import { getInvoiceStatusConfig } from '../constants/invoiceStatus';
import './InvoiceDetail.css';

const fmt = (val) => (val !== null && val !== undefined ? val : '—');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('vi-VN') : '—');
const fmtCurrency = (n) =>
  n !== null && n !== undefined
    ? Number(n).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    : '—';

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="info-row">
      <span className="info-label">
        {Icon && <Icon size={14} />}
        {label}
      </span>
      <span className="info-value">{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="section-card glass-card">
      <div className="section-header">
        {Icon && <Icon size={18} />}
        <h3>{title}</h3>
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}

function InvoiceStatusBadge({ status }) {
  const config = getInvoiceStatusConfig(status);
  return <span className={`invoice-status-badge badge-${config.color}`}>{config.label}</span>;
}

const InvoiceDetail = () => {
  const { invoiceCode } = useParams();
  const navigate = useNavigate();
  const { invoice, customer, reminder, reminderError, loading, error } = useInvoiceDetail(invoiceCode);

  if (loading) {
    return (
      <div className="invoice-detail-page">
        <div className="loading-container">
          <Loader2 size={36} className="animate-spin" />
          <p>Đang tải chi tiết hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-detail-page">
        <button className="btn btn-secondary back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <ErrorState message={error.message || 'Không thể tải chi tiết hóa đơn'} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="invoice-detail-page">
        <button className="btn btn-secondary back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <div className="empty-notice">
          <AlertCircle size={40} />
          <p>Không tìm thấy hóa đơn <strong>{invoiceCode}</strong></p>
        </div>
      </div>
    );
  }

  const invoiceDetails = Array.isArray(invoice.invoiceDetails)
    ? invoice.invoiceDetails
    : invoice.invoiceDetails
    ? [invoice.invoiceDetails]
    : [];
  const hasProductNotes = invoiceDetails.some((detail) => detail.note);

  const payments = Array.isArray(invoice.payments) ? invoice.payments : [];

  return (
    <div className="invoice-detail-page animate-fade-in">
      {/* Header */}
      <div className="detail-page-header">
        <button className="btn btn-secondary back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <div className="detail-page-title">
          <h2>
            <FileText size={20} />
            Chi tiết hóa đơn <span className="invoice-code-highlight">{invoice.code}</span>
          </h2>
          <p className="detail-page-subtitle">
            Ngày tạo: {fmtDate(invoice.purchaseDate)} &bull; Chi nhánh: {fmt(invoice.branchName)}
          </p>
        </div>
        {invoice.status !== undefined && (
          <InvoiceStatusBadge status={invoice.status} />
        )}
      </div>

      <div className="detail-grid">
        {/* Thông tin hóa đơn */}
        <SectionCard title="Thông tin hóa đơn" icon={FileText}>
          <InfoRow label="Mã hóa đơn" value={fmt(invoice.code)} icon={Hash} />
          <InfoRow label="Ngày mua" value={fmtDate(invoice.purchaseDate)} icon={Calendar} />
          <InfoRow label="Ngày tạo" value={fmtDateTime(invoice.createdDate)} icon={Calendar} />
          <InfoRow label="Ngày cập nhật" value={fmtDateTime(invoice.modifiedDate)} icon={Calendar} />
          <InfoRow label="Chi nhánh" value={fmt(invoice.branchName)} icon={Building2} />
          <InfoRow label="Nhân viên bán" value={fmt(invoice.soldByName)} icon={User} />
          {invoice.description && (
            <InfoRow label="Ghi chú" value={fmt(invoice.description)} icon={FileText} />
          )}

          <div className="divider" />

          <InfoRow label="Khách cần trả" value={fmtCurrency(invoice.total)} icon={CreditCard} />
          <InfoRow label="Khách đã trả" value={fmtCurrency(invoice.totalPayment)} icon={CreditCard} />
          {invoice.totalTax > 0 && (
            <InfoRow label="Thuế" value={fmtCurrency(invoice.totalTax)} icon={CreditCard} />
          )}
        </SectionCard>

        {/* Thông tin khách hàng */}
        <SectionCard title="Thông tin khách hàng" icon={User}>
          {customer ? (
            <>
              <InfoRow label="Tên khách hàng" value={fmt(customer.name)} icon={User} />
              <InfoRow label="Mã khách hàng" value={fmt(customer.code)} icon={Hash} />
              <InfoRow label="Số điện thoại" value={fmt(customer.contactNumber)} icon={Phone} />
              {customer.email && (
                <InfoRow label="Email" value={fmt(customer.email)} icon={Mail} />
              )}
              {customer.address && (
                <InfoRow label="Địa chỉ" value={fmt(customer.address)} icon={MapPin} />
              )}
              {customer.locationName && (
                <InfoRow label="Khu vực" value={fmt(customer.locationName)} icon={MapPin} />
              )}
              {customer.birthDate && (
                <InfoRow label="Ngày sinh" value={fmtDate(customer.birthDate)} icon={Calendar} />
              )}
              {customer.organization && (
                <InfoRow label="Công ty" value={fmt(customer.organization)} icon={Building2} />
              )}
              {customer.taxCode && (
                <InfoRow label="Mã số thuế" value={fmt(customer.taxCode)} icon={Hash} />
              )}

              <div className="divider" />

              <InfoRow label="Tổng mua" value={fmtCurrency(customer.totalInvoiced)} icon={CreditCard} />
              <InfoRow label="Nợ hiện tại" value={fmtCurrency(customer.debt)} icon={CreditCard} />
              {customer.totalPoint !== undefined && customer.totalPoint !== null && (
                <InfoRow label="Điểm tích lũy" value={fmt(customer.totalPoint)} icon={Hash} />
              )}
              {customer.groups && (
                <InfoRow label="Nhóm KH" value={fmt(customer.groups)} icon={User} />
              )}
            </>
          ) : (
            <>
              {/* Fallback: hiển thị thông tin từ hóa đơn */}
              <InfoRow label="Tên khách hàng" value={fmt(invoice.customerName)} icon={User} />
              <InfoRow label="Mã khách hàng" value={fmt(invoice.customerCode)} icon={Hash} />
              <p className="customer-note">Không thể tải thêm thông tin chi tiết khách hàng.</p>
            </>
          )}
        </SectionCard>
      </div>

      {/* Sản phẩm trong hóa đơn */}
      {invoiceDetails.length > 0 && (
        <SectionCard title={`Sản phẩm (${invoiceDetails.length})`} icon={Package}>
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th>Mã SP</th>
                  <th className="text-right">Số lượng</th>
                  <th className="text-right">Đơn giá</th>
                  <th className="text-right">Giảm giá</th>
                  <th className="text-right">Thành tiền</th>
                  {hasProductNotes && <th>Ghi chú</th>}
                </tr>
              </thead>
              <tbody>
                {invoiceDetails.map((detail, idx) => {
                  const subtotal =
                    detail.price && detail.quantity
                      ? detail.price * detail.quantity - (detail.discount || 0)
                      : null;
                  return (
                    <tr key={detail.productId || idx}>
                      <td className="text-muted">{idx + 1}</td>
                      <td className="product-name">{fmt(detail.productName)}</td>
                      <td className="text-muted">{fmt(detail.productCode)}</td>
                      <td className="text-right">{fmt(detail.quantity)}</td>
                      <td className="text-right">{fmtCurrency(detail.price)}</td>
                      <td className="text-right">
                        {detail.discountRatio
                          ? `${detail.discountRatio}%`
                          : fmtCurrency(detail.discount)}
                      </td>
                      <td className="text-right font-medium">{fmtCurrency(subtotal)}</td>
                      {hasProductNotes && <td className="text-muted">{detail.note || '—'}</td>}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="text-right total-label">
                    Tổng cộng
                  </td>
                  <td className="text-right total-value">{fmtCurrency(invoice.total)}</td>
                  {hasProductNotes && <td />}
                </tr>
              </tfoot>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Lịch nhắc nhở ZNS */}
      {reminderError && (
        <div className="reminder-warning">
          <AlertCircle size={16} />
          <span>Không thể tải ghi chú và trạng thái nhắc ZNS của hóa đơn này.</span>
        </div>
      )}

      {reminder && (
        <SectionCard title="Lịch nhắc nhở ZNS" icon={Bell}>
          <InfoRow
            label="Trạng thái"
            value={<StatusBadge sent={reminder.sent} cancelled={reminder.cancelled} error={reminder.error} />}
            icon={Bell}
          />
          <InfoRow label="Ngày nhắc" value={fmtDate(reminder.due_date)} icon={Calendar} />
          <InfoRow label="Ngày mua (ghi nhận)" value={fmtDate(reminder.purchase_date)} icon={Calendar} />
          {reminder.sent && (
            <InfoRow label="Thời gian gửi" value={fmtDateTime(reminder.sent_at)} icon={Calendar} />
          )}
          {reminder.note && (
            <>
              <div className="divider" />
              <InfoRow
                label="Ghi chú"
                value={
                  <span className="reminder-detail-note">{reminder.note}</span>
                }
                icon={StickyNote}
              />
            </>
          )}
        </SectionCard>
      )}

      {/* Thông tin thanh toán */}
      {payments.length > 0 && (
        <SectionCard title="Lịch sử thanh toán" icon={CreditCard}>
          <div className="payments-list">
            {payments.map((p, idx) => (
              <div key={p.id || idx} className="payment-item">
                <div className="payment-details">
                  <div className="payment-row">
                    <span className="payment-label">Phương thức:</span>
                    <span className="payment-value payment-method">{getPaymentMethodLabel(p.method)}</span>
                  </div>
                  {p.bankAccount && (
                    <div className="payment-row">
                      <span className="payment-label">Tài khoản:</span>
                      <span className="payment-value payment-bank">{p.bankAccount}</span>
                    </div>
                  )}
                  <div className="payment-row">
                    <span className="payment-label">Thời gian:</span>
                    <span className="payment-value payment-date">{fmtDateTime(p.transDate)}</span>
                  </div>
                  <div className="payment-row payment-amount-row">
                    <span className="payment-label">Số tiền:</span>
                    <span className="payment-value payment-amount">{fmtCurrency(p.amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default InvoiceDetail;
