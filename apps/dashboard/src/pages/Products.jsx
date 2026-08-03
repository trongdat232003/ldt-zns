import React, { useState } from 'react';
import {
  Package,
  Loader2,
  RefreshCw,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../contexts/ToastContext';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import './Products.css';

const PAGE_SIZE = 15;

const Products = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'other' ? 'other' : 'oil';

  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [confirmDelete, setConfirmDelete] = useState(null); // product_id to delete
  const [isDeleting, setIsDeleting] = useState(false);

  const { products, totalCount, loading, error, refetch, addProduct, deleteProduct } = useProducts({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
  });
  const toast = useToast();

  // Currently we only handle "oil" products since fetchOtherProducts was empty
  const otherProducts = [];
  const loadingOther = false;

  const handleRefresh = () => {
    if (activeTab === 'oil') {
      refetch();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    const { error } = await deleteProduct(confirmDelete);
    setIsDeleting(false);
    setConfirmDelete(null);
    if (error) {
      toast.error('Lỗi khi xoá sản phẩm: ' + error.message);
    } else {
      toast.success('Đã xoá sản phẩm thành công.');
    }
  };

  const handleAddOil = async (product) => {
    const { error } = await addProduct(product);
    if (error) {
      toast.error('Lỗi khi thêm sản phẩm: ' + error.message);
    } else {
      toast.success(`Đã thêm "${product.product_name}" vào danh sách nhớt!`);
    }
  };

  const activeData = activeTab === 'oil' ? products : otherProducts;

  // filteredProducts is already filtered server-side for oil tab
  const filteredProducts = activeData;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="products-page">
      <div className="products-header glass-card">
        <div className="products-title">
          <Package size={22} />
          <h2>Quản lý sản phẩm</h2>
        </div>

        <div className="products-actions">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="input-field search-input"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            />
          </div>
          <button className="btn btn-secondary" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <ErrorState message={error.message} onRetry={refetch} />
      )}

      <div className="products-grid">
        {(activeTab === 'oil' ? loading : loadingOther) ? (
          <div className="loading-container">
            <Loader2 size={32} className="animate-spin" />
            <p>Đang tải danh sách sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={<Package size={48} />}
            message="Không tìm thấy sản phẩm nào"
          />
        ) : (
          filteredProducts.map((product, index) => (
            <div
              key={product.product_id}
              className="product-card glass-card"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="product-info">
                <h3 title={product.product_name}>{product.product_name}</h3>
                <span className="product-category">{product.category_name || 'Không rõ'}</span>
                <span className="product-id">ID: {product.product_id}</span>
              </div>

              {activeTab === 'oil' ? (
                <button
                  className="btn-icon-danger"
                  title="Xoá khỏi danh sách nhớt"
                  onClick={() => setConfirmDelete(product.product_id)}
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                  title="Thêm vào danh sách nhớt"
                  onClick={() => handleAddOil(product)}
                >
                  Thêm vào nhớt
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredProducts.length > 0 && totalPages > 1 && (
        <div className="pagination" style={{ marginTop: '1.5rem' }}>
          <button
            className="btn btn-secondary pagination-btn"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={16} /> Trước
          </button>
          <span className="page-info">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            className="btn btn-secondary pagination-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Sau <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Xoá sản phẩm"
        message="Bạn có chắc chắn muốn xoá sản phẩm này khỏi danh sách nhớt?"
        confirmText="Xoá"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Products;
