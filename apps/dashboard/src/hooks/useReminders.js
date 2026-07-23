import { useState, useEffect, useCallback } from 'react';
import { getReminders } from '../services/reminders.service';

export function useReminders(filters) {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, count, error } = await getReminders(filters);
    
    if (error) {
      setError(error);
    } else {
      setData(data);
      setTotalCount(count);
    }
    setLoading(false);
  }, [filters.page, filters.statusFilter, filters.searchTerm, filters.pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, totalCount, loading, error, refetch: load };
}
