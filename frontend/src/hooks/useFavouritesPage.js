// hooks/useFavourites.js
import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_FAVOURITES } from "../data/mockFavourites";
import { sleep, sortVehicles } from "../utils/favouriteUtils";

/**
 * Encapsulates all favourites business logic.
 * Swap the mock fetch inside useEffect with a real API call when ready:
 *   const res = await api.get('/favourites');
 *   setFavourites(res.data);
 */
export function useFavourites() {
  const navigate = useNavigate();

  const [loading, setLoading]             = useState(true);
  const [favourites, setFavourites]       = useState([]);
  const [sortBy, setSortBy]               = useState("added");
  const [bookingVehicle, setBookingVehicle] = useState(null);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchFavourites = async () => {
      await sleep(1200); // replace with: const res = await api.get('/favourites')
      setFavourites(MOCK_FAVOURITES);
      setLoading(false);
    };
    fetchFavourites();
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Optimistically removes a vehicle; replace sleep() with api.delete() */
  const handleRemove = useCallback((vehicleId) => {
    setFavourites((prev) => prev.filter((v) => v._id !== vehicleId));
    // await api.delete(`/favourites/${vehicleId}`)
  }, []);

  /** Clears all favourites; replace with api.delete('/favourites') */
  const handleClearAll = useCallback(() => {
    setFavourites([]);
  }, []);

  const handleViewDetails = useCallback(
    (vehicle) => navigate(`/vehicle/${vehicle._id}`, { state: { vehicle } }),
    [navigate]
  );

  const handleBook    = useCallback((vehicle) => setBookingVehicle(vehicle), []);
  const handleExplore = useCallback(() => navigate("/"), [navigate]);
  const closeBooking  = useCallback(() => setBookingVehicle(null), []);

  // ── Derived state ──────────────────────────────────────────────────────────
  const sortedFavourites = useMemo(
    () => sortVehicles(favourites, sortBy),
    [favourites, sortBy]
  );

  return {
    // state
    loading,
    favourites,
    sortBy,
    sortedFavourites,
    bookingVehicle,
    // actions
    setSortBy,
    handleRemove,
    handleClearAll,
    handleViewDetails,
    handleBook,
    handleExplore,
    closeBooking,
  };
}