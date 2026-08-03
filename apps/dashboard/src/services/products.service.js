import { supabase } from '../lib/supabase';

export async function getProducts({ page = 0, pageSize = 20, search = '' } = {}) {
  let query = supabase
    .from('oil_products')
    .select('*', { count: 'exact' })
    .order('product_name', { ascending: true });

  if (search.trim()) {
    query = query.ilike('product_name', `%${search.trim()}%`);
  }

  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, count, error } = await query;

  return { data: data || [], count: count || 0, error };
}

export async function addProduct(product) {
  const { data, error } = await supabase
    .from('oil_products')
    .upsert({
      product_id: product.product_id,
      product_name: product.product_name,
      category_name: product.category_name
    }, { onConflict: 'product_id' });

  return { data, error };
}

export async function deleteProduct(productId) {
  const { data, error } = await supabase
    .from('oil_products')
    .delete()
    .eq('product_id', productId);

  return { data, error };
}
