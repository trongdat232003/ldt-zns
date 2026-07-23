import { supabase, createServiceRoleClient } from '@zns-auto/db/client';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  
  // Xác minh role là admin bằng service_role client để bypass RLS
  const supabaseAdmin = createServiceRoleClient();
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  if (roleError || !roleData || roleData.role !== 'admin') {
    console.error('Role check failed:', roleError || 'User is not admin');
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }
  
  req.user = user;
  next();
};
