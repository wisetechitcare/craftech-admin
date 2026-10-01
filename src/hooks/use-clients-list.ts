import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import { cmsApi } from "@/services/api";
import type { ClientRecord } from "@/types/clients";

export function useClientsList() {
  const [items, setItems] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const response = await cmsApi.getClients();
      if (response.data?.success) {
        setItems(response.data.data ?? []);
      }
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message || "Failed to load clients"
        : "Failed to load clients";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, loading, reload };
}
