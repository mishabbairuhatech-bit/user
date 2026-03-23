import { useState, useCallback } from 'react';
import api from '@services/api';

/**
 * Hook for server-side searchable Select dropdowns.
 * Returns { options, loading, onSearch } to pass to Select component.
 *
 * @param {string} url - API endpoint
 * @param {object} params - Extra query params (e.g. { type: 'vendor' })
 * @param {function} mapOption - (item) => { value, label }
 */
const useAsyncOptions = (url, params = {}, mapOption = (item) => ({ value: item.id, label: item.name })) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSearch = useCallback(async (search) => {
    setLoading(true);
    try {
      const res = await api.get(url, {
        params: { ...params, limit: 30, search: search || undefined },
      });
      const d = res.data;
      const items = d?.data?.items || d?.data || d?.items || [];
      const list = Array.isArray(items) ? items : [];
      setOptions(list.map(mapOption));
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(params)]);

  return { options, loading, onSearch };
};

export default useAsyncOptions;
