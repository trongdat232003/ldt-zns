import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Package,
  Loader2,
  RefreshCw,
  Trash2,
  Search
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import './Products.css';

const Products = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'other' ? 'other' : 'oil';
  
  const [products, setProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOther, setLoadingOther] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'other' && otherProducts.length === 0) {
      fetchOtherProducts();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('oil_products')
        .select('*')
        .order('product_name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherProducts = async () => {
    // Chưa cần fetch sản phẩm khác
    setOtherProducts([]);
  };

  const handleRefresh = () => {
    if (activeTab === 'oil') {
      fetchProducts();
    } else {
      fetchOtherProducts();
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá sản phẩm này khỏi danh sách nhớt?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('oil_products')
        .delete()
        .eq('product_id', productId);

      if (error) throw error;
      setProducts(products.filter(p => p.product_id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Lỗi khi xoá sản phẩm: ' + err.message);
    }
  };

  const handleAddOil = async (product) => {
    try {
      const { error } = await supabase
        .from('oil_products')
        .upsert({
          product_id: product.product_id,
          product_name: product.product_name,
          category_name: product.category_name
        }, { onConflict: 'product_id' });

      if (error) throw error;
      
      alert(`Đã thêm "${product.product_name}" vào danh sách nhớt!`);
      // Update local state
      setProducts([...products, product].sort((a, b) => a.product_name.localeCompare(b.product_name)));
      setOtherProducts(otherProducts.filter(p => p.product_id !== product.product_id));
      
    } catch (err) {
      console.error('Error adding oil product:', err);
      alert('Lỗi khi thêm: ' + err.message);
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
