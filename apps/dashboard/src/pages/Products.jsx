import React, { useState } from 'react';
import {
  Package,
  Loader2,
  RefreshCw,
  Trash2,
  Search
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../contexts/ToastContext';
import './Products.css';

const Products = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'other' ? 'other' : 'oil';
  
  const { products, loading, error, refetch, addProduct, deleteProduct } = useProducts();
  const toast = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Currently we only handle "oil" products since fetchOtherProducts was empty
  const otherProducts = [];
  const loadingOther = false;

  const handleRefresh = () => {
    if (activeTab === 'oil') {
      refetch();
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá sản phẩm này khỏi danh sách nhớt?')) {
      return;
    }

    const { error } = await deleteProduct(productId);
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
  
  const filteredProducts = activeData.filter(p =>
    p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
          Có lỗi xảy ra: {error.message}
        </div>
      )}

      <div className="products-grid">
        {(activeTab === 'oil' ? loading : loadingOther) ? (
          <div className="loading-container">
            <Loader2 size={32} className="animate-spin" />
            <p>Đang tải danh sách sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="loading-container">
            <Package size={48} style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
            <p>Không tìm thấy sản phẩm nào</p>
          </div>
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
                  onClick={() => handleDelete(product.product_id)}
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
    </div>
  );
};

export default Products;
