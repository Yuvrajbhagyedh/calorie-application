import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Entry } from '../types';

export const useEntries = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    // Check if user is authenticated before making the request
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Entry[]>('/api/entries');
      setEntries(data);
    } catch (err: any) {
      // Don't set error for 401 as it's handled by the interceptor
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Unable to load entries');
      }
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (entry: Omit<Entry, 'id'>) => {
    await api.post('/api/entries', entry);
    fetchEntries();
  };

  const updateEntry = async (id: number, entry: Partial<Entry>) => {
    await api.put(`/api/entries/${id}`, entry);
    fetchEntries();
  };

  const deleteEntry = async (id: number) => {
    await api.delete(`/api/entries/${id}`);
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  useEffect(() => {
    // Only fetch if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      fetchEntries();
    }
  }, []);

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
};

