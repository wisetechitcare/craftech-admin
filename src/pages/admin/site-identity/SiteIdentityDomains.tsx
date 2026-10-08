import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Edit2, Globe, Loader2, Plus, Trash2 } from "lucide-react";

import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import InputField from "@/components/admin/ui/InputField";
import Modal from "@/components/admin/ui/Modal";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { Button } from "@/components/ui/button";
import { AdminInfoCallout } from "@/components/common";

import {
  DOMAIN_HOST_HINT,
  DOMAIN_HOST_MAX_LENGTH,
  validateDomainHostInput,
} from "@/lib/utils/domain-host";
import { domainsApi } from "@/services/api";

interface DomainRow {
  _id: string;
  host: string;
}

type DomainModalMode = "add" | "edit";

const apiMessage = (error: unknown, fallback: string) =>
  isAxiosError(error) ? error.response?.data?.message || fallback : fallback;

export default function SiteIdentityDomains() {
  const [rows, setRows] = useState<DomainRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<DomainModalMode>("add");
  const [modalHost, setModalHost] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalSaving, setModalSaving] = useState<boolean>(false);
  const [modalTouched, setModalTouched] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const modalHostError = modalTouched
    ? validateDomainHostInput(modalHost)
    : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await domainsApi.list();
      if (res.data?.success) {
        setRows(
          (res.data.data as { _id: string; host: string }[]).map((row) => ({
            _id: row._id,
            host: row.host,
          })),
        );
      }
    } catch {
      toast.error("Could not load domains");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const closeModal = () => {
    setModalOpen(false);
    setModalHost("");
    setEditingId(null);
    setModalTouched(false);
  };

  const openAddModal = () => {
    setModalMode("add");
    setModalHost("");
    setEditingId(null);
    setModalTouched(false);
    setModalOpen(true);
  };

  const openEditModal = (row: DomainRow) => {
    setModalMode("edit");
    setModalHost(row.host);
    setEditingId(row._id);
    setModalTouched(false);
    setModalOpen(true);
  };

  const onModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalTouched(true);
    const fieldError = validateDomainHostInput(modalHost);
    if (fieldError) return;

    const host = modalHost.trim();
    setModalSaving(true);
    try {
      if (modalMode === "edit" && editingId) {
        await domainsApi.update(editingId, { host });
        toast.success("Domain updated");
      } else {
        await domainsApi.create({ host });
        toast.success("Domain added");
      }
      closeModal();
      await load();
    } catch (error) {
      toast.error(
        apiMessage(
          error,
          modalMode === "edit"
            ? "Could not update domain"
            : "Could not add domain",
        ),
      );
    } finally {
      setModalSaving(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await domainsApi.remove(deleteId);
      toast.success("Domain removed");
      setDeleteId(null);
      await load();
    } catch (error) {
      toast.error(apiMessage(error, "Could not remove domain"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-ink-faint" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminInfoCallout description="Hostnames listed here open this website. Use the exact name visitors type (for example www.example.com or bm.localhost in dev). Duplicates across the platform are not allowed." />

      <SectionCard
        title="Domains"
        description="Each hostname routes to this website in the selected workspace."
        controls={
          <Button
            variant="primary"
            size="sm"
            className="text-sm font-bold"
            startIcon={<Plus size={20} />}
            onClick={openAddModal}
          >
            Add domain
          </Button>
        }
      >
        {!rows.length ? (
          <p className="text-sm text-ink-mute">
            No domains yet. Add one to get started.
          </p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {rows.map((row) => (
              <li
                key={row._id}
                className="flex items-center justify-between gap-3 bg-paper px-4 py-3 first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0 text-ink-faint" />
                  <span className="truncate font-medium text-ink">
                    {row.host}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(row)}
                    className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-raise hover:text-ink"
                    aria-label={`Edit ${row.host}`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(row._id)}
                    className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label={`Remove ${row.host}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <Modal
        open={modalOpen}
        title={modalMode === "edit" ? "Edit domain" : "Add domain"}
        description="Use the hostname only — no https:// or path."
        onClose={closeModal}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeModal}
              disabled={modalSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="domain-form"
              size="sm"
              disabled={
                modalSaving || !modalHost.trim() || Boolean(modalHostError)
              }
              startIcon={
                modalSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : undefined
              }
            >
              {modalMode === "edit" ? "Save changes" : "Add domain"}
            </Button>
          </>
        }
      >
        <form id="domain-form" onSubmit={onModalSubmit}>
          <InputField
            label="Domain"
            value={modalHost}
            onChange={(e) => {
              setModalHost(e.target.value);
              setModalTouched(true);
            }}
            onBlur={() => setModalTouched(true)}
            placeholder="www.example.com"
            autoComplete="off"
            maxLength={DOMAIN_HOST_MAX_LENGTH}
            error={Boolean(modalHostError)}
            hint={modalHostError ?? DOMAIN_HOST_HINT}
            required
          />
        </form>
      </Modal>

      <ConfirmModal
        open={deleteId !== null}
        title="Remove domain?"
        message="Visitors using this hostname will no longer reach this site until you add it again."
        onCancel={() => setDeleteId(null)}
        onConfirm={onConfirmDelete}
        loading={deleting}
      />
    </div>
  );
}
