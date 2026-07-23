import { supabase } from '../lib/supabase';

export async function getProducts() {
  const { data, error } = await supabase
    .from('oil_products')
    .select('*')
    .order('product_name', { ascending: true });

  return { data: data || [], error };
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
