import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Edit2, Link as LinkIcon, Plus, Trash2 } from "lucide-react";

import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { Button } from "@/components/ui/button";

import { CLIENTS_ADMIN_PATH } from "@/lib/constants/clients";
import { cmsApi } from "@/services/api";
import type { ClientRecord } from "@/types/clients";

interface ClientsLogosPanelProps {
  items: ClientRecord[];
  loading: boolean;
  onReload: () => Promise<void>;
  nested?: boolean;
}

const ClientsLogosPanel = ({
  items,
  loading,
  onReload,
  nested = false,
}: ClientsLogosPanelProps) => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    let message = "Failed to delete client";
    let isError = true;
    setDeleting(true);

    try {
      const response = await cmsApi.deleteClient(deleteId);
      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setDeleteId(null);
        await onReload();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) toast.error(message);
      else toast.success(message);
      setDeleting(false);
    }
  };

  return (
    <>
      <SectionCard
        title="Client logos"
        description="One list for Global Clients, Home, About, and the public site — the same records everywhere."
        nested={nested}
        controls={
          <Button
            variant="primary"
            size="sm"
            className="text-sm font-bold"
            startIcon={<Plus size={20} />}
            onClick={() => navigate(`${CLIENTS_ADMIN_PATH}/new`)}
          >
            Add client
          </Button>
        }
      >
        {loading ? (
          <p className="text-sm text-ink-mute">Loading clients…</p>
        ) : !items.length ? (
          <p className="text-sm text-ink-mute">
            No clients yet. Add one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-paper border border-line rounded-xl p-4 relative group text-center flex flex-col items-center justify-center min-h-36"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`${CLIENTS_ADMIN_PATH}/${item._id}/edit`)
                    }
                    className="p-1.5 bg-raise text-ink-soft rounded hover:bg-line hover:text-ink transition-colors"
                    aria-label={`Edit ${item.name}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item._id)}
                    className="p-1.5 bg-danger/10 text-danger rounded hover:bg-danger/10 transition-colors"
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="h-12 object-contain mb-3"
                  />
                ) : (
                  <div className="h-12 w-full bg-raise/50 rounded mb-3 flex items-center justify-center text-xs text-ink-faint">
                    No logo
                  </div>
                )}
                <p className="text-sm font-medium text-ink truncate w-full">
                  {item.name}
                </p>
                {item.website && (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-info flex items-center gap-1 mt-1 hover:underline"
                  >
                    <LinkIcon className="w-2.5 h-2.5" /> Link
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete this client?"
        message="The logo is removed from the shared list. Placements that are still on will show fewer logos."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
};

export default ClientsLogosPanel;
