import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats } from '../services/reminders.service';

export function useDashboard() {
  const [stats, setStats] = useState({
    totalReminders: 0,
    sentToday: 0,
    pending: 0,
    failed: 0,
  });
  const [recentReminders, setRecentReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { stats: fetchedStats, recentReminders: fetchedRecent, error } = await getDashboardStats();
    
    if (error) setError(error);
    else {
      setStats(fetchedStats);
      setRecentReminders(fetchedRecent);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, recentReminders, loading, error, refetch: load };
}
