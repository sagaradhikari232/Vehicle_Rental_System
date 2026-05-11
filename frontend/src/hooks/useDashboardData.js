// hooks/useDashboardData.js
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api'; // your existing axios instance

/**
 * Generic fetch hook — wraps your existing `api` instance.x
 * Handles loading, error, and refetch.
 */
export function useFetch(url, options = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url, options);
      // Your controllers wrap responses in { data: { ... } } or { data: [...] }
      // Unwrap one level: res.data.data ?? res.data
      setData(res.data?.data ?? res.data);
    } catch (err) {
      setError(err?.response?.data?.message ?? err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Vehicles  →  GET /api/v1/vehicles/get-allvehicles
 */
export function useVehicles() {
  return useFetch('/vehicles/get-allvehicles');
}

/**
 * Bookings (admin)  →  GET /api/v1/bookings/
 */
export function useBookings() {
  return useFetch('/bookings/');
}

/**
 * Users (admin)  →  GET /api/v1/users/all
 */
export function useUsers() {
  return useFetch('/users/all');
}

/**
 * Payments (admin)  →  GET /api/v1/payments/
 */
export function usePayments() {
  return useFetch('/payments/');
}