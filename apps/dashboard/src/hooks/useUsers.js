import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser as createUserService, updatePassword as updatePasswordService, updateRole as updateRoleService, deleteUser as deleteUserService } from '../services/users.service';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getUsers();
    
    if (error) setError(error);
    else setUsers(data);
    
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createUser = async (userData) => {
    const { error } = await createUserService(userData);
    if (!error) await load();
    return { error };
  };

  const updatePassword = async (id, password) => {
    const { error } = await updatePasswordService(id, password);
    return { error };
  };

  const updateRole = async (id, role) => {
    const { error } = await updateRoleService(id, role);
    if (!error) await load();
    return { error };
  };

  const deleteUser = async (id) => {
    const { error } = await deleteUserService(id);
    if (!error) await load();
    return { error };
  };

  return { users, loading, error, refetch: load, createUser, updatePassword, updateRole, deleteUser };
}
