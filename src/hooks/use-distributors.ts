"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase, type DbDistributor } from "@/lib/supabase/client";
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

  const fetchActiveDistributors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("distributors")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setDistributorList(data.map(mapDbDistributor));
      } else if (!error && data && data.length === 0) {
        // If DB table is initialized but has no records yet, keep fallback
        setDistributorList(fallbackDistributors);
      }
    } catch (err) {
      console.warn("Failed to load distributors from Supabase, using fallback:", err);
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

    // Subscribe to realtime database changes
    const channel = supabase
      .channel("distributors_live_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "distributors" },
        () => {
          fetchActiveDistributors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
