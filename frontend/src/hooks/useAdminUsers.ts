import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Entry, UserStats } from '../types';

export const useAdminUsers = (enabled = true) => {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [selectedUserEntries, setSelectedUserEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<UserStats[]>('/api/admin/users');
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEntries = async (userId: number) => {
    const { data } = await api.get<Entry[]>(`/api/admin/users/${userId}/entries`);
    setSelectedUserEntries(data);
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }
    fetchUsers();
  }, [enabled]);

  return {
    users,
    loading,
    error,
    selectedUserEntries,
    fetchUsers,
    fetchUserEntries,
  };
};

