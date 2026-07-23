import { apiRequest } from '../lib/apiClient';

export async function getUsers() {
  try {
    const data = await apiRequest('/users');
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createUser(userData) {
  try {
    const data = await apiRequest('/users', {
      method: 'POST',
      body: userData
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updatePassword(id, password) {
  try {
    const data = await apiRequest(`/users/${id}/password`, {
      method: 'PUT',
      body: { password }
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateRole(id, role) {
  try {
    const data = await apiRequest(`/users/${id}/role`, {
      method: 'PUT',
      body: { role }
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteUser(id) {
  try {
    const data = await apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
