"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { DbDistributor } from "@/types/distributor";
import {
  distributors as fallbackDistributors,
  type Distributor,
  badgeTierOrder,
} from "@/data/distributors";

export function mapDbDistributor(db: DbDistributor): Distributor {
  return {
    id: db.id,
    cityId: String(db.wilaya_code),
    wilayaCode: db.wilaya_code,
    name: db.name,
    badge: db.badge,
    phones: db.phone ? [db.phone] : [],
    locationUrl: db.location_url || undefined,
    note: db.address || undefined,
  };
}

export function useDistributors(initialCustom?: Distributor[]) {
  const [distributorList, setDistributorList] = useState<Distributor[]>(
    initialCustom || fallbackDistributors
  );
  const [isLoading, setIsLoading] = useState(true);

  // Active points of sale from the server (empty database → keep the
  // built-in examples, as before)
  const fetchActiveDistributors = useCallback(async () => {
    try {
      const res = await fetch("/api/distributors");
      const json = await res.json();
      const data: DbDistributor[] = Array.isArray(json.data) ? json.data : [];
      setDistributorList(data.length > 0 ? data.map(mapDbDistributor) : fallbackDistributors);
    } catch (err) {
      console.warn("Failed to load points of sale, using the built-in list:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCustom) {
      setDistributorList(initialCustom);
      setIsLoading(false);
      return;
    }

    fetchActiveDistributors();

    // Pick up admin changes when the visitor comes back to the tab
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchActiveDistributors();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [initialCustom, fetchActiveDistributors]);

  const activeWilayaCodes = useMemo(
    () => new Set(distributorList.map((d) => d.wilayaCode)),
    [distributorList]
  );

  const getDistributorsByWilaya = useCallback(
    (code: number): Distributor[] => {
      return distributorList
        .filter((d) => d.wilayaCode === code)
        .sort((a, b) => badgeTierOrder[a.badge] - badgeTierOrder[b.badge]);
    },
    [distributorList]
  );

  return {
    distributors: distributorList,
    activeWilayaCodes,
    getDistributorsByWilaya,
    isLoading,
    refresh: fetchActiveDistributors,
  };
}
