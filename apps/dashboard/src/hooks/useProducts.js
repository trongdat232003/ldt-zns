import { useState, useEffect, useCallback } from 'react';
import { getProducts, addProduct as addProductService, deleteProduct as deleteProductService } from '../services/products.service';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getProducts();
    
    if (error) setError(error);
    else setProducts(data);
    
    setLoading(false);
  }, []);

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

  return { products, loading, error, refetch: load, addProduct, deleteProduct };
}
