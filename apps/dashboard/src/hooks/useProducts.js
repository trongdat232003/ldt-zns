import { useState, useEffect, useCallback } from 'react';
import { getProducts, addProduct as addProductService, deleteProduct as deleteProductService } from '../services/products.service';

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, count, error } = await getProducts(filters);
    
    if (error) setError(error);
    else {
      setProducts(data);
      setTotalCount(count);
    }
    
    setLoading(false);
  }, [filters.page, filters.pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const addProduct = async (product) => {
    const { error } = await addProductService(product);
    if (!error) {
      await load();
    }
    return { error };
  };

  const deleteProduct = async (productId) => {
    const { error } = await deleteProductService(productId);
    if (!error) {
      await load();
    }
    return { error };
  };

  return { products, totalCount, loading, error, refetch: load, addProduct, deleteProduct };
}
