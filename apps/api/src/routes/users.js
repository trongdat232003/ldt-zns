import express from 'express';
import { createServiceRoleClient } from '@zns-auto/db/client';

const router = express.Router();
// Create client per-request or globally? We'll create one globally since it's an admin server.
const supabaseAdmin = createServiceRoleClient();

router.get('/', async (req, res) => {
  try {
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role');
    if (rolesError) throw rolesError;

    const rolesMap = {};
    roles.forEach(r => { rolesMap[r.user_id] = r.role });

    const mergedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      role: rolesMap[u.id] || 'staff'
    }));

    res.json(mergedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (error) throw error;
    
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: data.user.id, role: role || 'staff' });
      
    if (roleError) throw roleError;
    
    res.status(201).json({ success: true, user: data.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password
    });
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const { error } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: id, role });
      
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (error) throw error;
        
        // Also try to delete from user_roles
        await supabaseAdmin.from('user_roles').delete().eq('user_id', id);
        
        res.json({ success: true });
    } catch(error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
