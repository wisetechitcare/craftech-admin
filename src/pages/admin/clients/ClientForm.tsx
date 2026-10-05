import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import ClientLogoFields from "@/components/admin/clients/ClientLogoFields";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { Button } from "@/components/ui/button";

import { cmsApi } from "@/services/api";
import type { ClientFormValues } from "@/types/clients";

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ClientFormValues>({
    logo: "",
    website: "",
    displayName: "",
  });
  const [logoLink, setLogoLink] = useState("");

  useEffect(() => {
    if (!id) return;

    cmsApi
      .getClients()
      .then((res) => {
        const client = res.data?.data?.find(
          (item: { _id: string }) => item._id === id,
        );
        if (client) {
          setForm({
            logo: client.logo ?? "",
            website: client.website ?? "",
            displayName: client.displayName ?? "",
          });
        } else {
          toast.error("Client not found");
          navigate("/admin/clients");
        }
      })
      .catch(() => toast.error("Failed to load client"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const logo = form.logo.trim() || logoLink.trim();
    if (!logo) {
      toast.error("Upload a logo or paste a logo link");
      return;
    }

    const payload = {
      logo,
      website: form.website.trim() || undefined,
      displayName: form.displayName.trim() || undefined,
    };

    let message = "Failed to save client";
    let isError = true;
    setSubmitting(true);

    try {
      const response = id
        ? await cmsApi.updateClient(id, payload)
        : await cmsApi.createClient(payload);

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        navigate("/admin/clients");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) toast.error(message);
      else toast.success(message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-ink-faint" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/admin/clients")}
          aria-label="Back to clients"
          className="p-2 rounded-lg bg-raise hover:bg-line transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-ink">
            {id ? "Edit client" : "Add client"}
          </h2>
          <p className="text-sm text-ink-mute">
            Updates the shared client list used on every Clients placement.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <SectionCard
          title="Client details"
          description="Upload a logo or paste an external image URL. Optional website link opens when visitors click the logo on the site."
        >
          <ClientLogoFields
            form={form}
            onChange={setForm}
            logoLink={logoLink}
            onLogoLinkChange={setLogoLink}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="text-sm font-bold"
              size="sm"
              startIcon={
                submitting ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Save className="size-5" />
                )
              }
            >
              {id ? "Save changes" : "Add client"}
            </Button>
          </div>
        </SectionCard>
      </form>
    </div>
  );
};

export default ClientForm;
