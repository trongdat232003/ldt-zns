const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require("@supabase/supabase-js");

// Polyfill cho Node 16
if (!globalThis.fetch) {
  globalThis.fetch = require("node-fetch");
  globalThis.Headers = require("node-fetch").Headers;
  globalThis.Request = require("node-fetch").Request;
  globalThis.Response = require("node-fetch").Response;
}

// Initialize Supabase Admin Client
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const app = express();
app.use(cors());
app.use(express.json());

// Middleware xác thực Admin
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  
  // Xác minh role là admin
  const { data: roleData } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  if (!roleData || roleData.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }
  
  req.user = user;
  next();
};

const { getAllProducts } = require('./simpleReminder');

app.use('/api', authMiddleware);

app.get('/api/products', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
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

app.post('/api/users', async (req, res) => {
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

app.put('/api/users/:id/password', async (req, res) => {
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

app.put('/api/users/:id/role', async (req, res) => {
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

app.delete('/api/users/:id', async (req, res) => {
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

const PORT = process.env.PORT || 3456;
app.listen(PORT, () => {
  console.log(`ZNS API Server running on port ${PORT}`);
});
