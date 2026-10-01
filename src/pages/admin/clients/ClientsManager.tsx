import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import ClientsLogosPanel from "@/components/admin/clients/ClientsLogosPanel";
import { PageHeader } from "@/components/common";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import { PreviewSection } from "@/components/admin/ui/SitePreview";
import SectionContentCard from "@/components/admin/ui/SectionContentCard";
import SwitchOptionsCard from "@/components/admin/ui/SwitchOptionsCard";
import {
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";

import {
  isAnyClientsPlacementOn,
  isClientsGlobalOn,
  setClientsGlobalMode,
} from "@/lib/clients-visibility";
import {
  CLIENTS_PLACEMENT_SWITCHES,
  CLIENTS_SECTION_DEFAULTS,
  CLIENTS_SECTION_FIELDS,
  CLIENTS_SECTION_VISIBILITY_KEY,
  CLIENTS_VISIBILITY,
} from "@/lib/constants/clients";
import { updateAppearanceVisibility } from "@/lib/utils/appearance";
import { useClientsList } from "@/hooks/use-clients-list";
import { appearanceApi, cmsApi } from "@/services/api";
import type { ClientsSectionContent } from "@/types/clients";

const ClientsManager = () => {
  const { items, loading: clientsLoading, reload } = useClientsList();
  const [section, setSection] = useState<ClientsSectionContent>(
    CLIENTS_SECTION_DEFAULTS,
  );
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [loading, setLoading] = useState(true);
  const [savingMode, setSavingMode] = useState(false);

  const globalMode = isClientsGlobalOn(visibility);
  const sectionShown = isAnyClientsPlacementOn(visibility);

  useEffect(() => {
    appearanceApi
      .get()
      .then(
        ({ data }) =>
          data?.success && setVisibility(data.data.visibility ?? {}),
      )
      .catch(() => toast.error("Failed to load visibility"));
    cmsApi
      .getClientsSection()
      .then(({ data }) => data?.success && setSection(data.data))
      .catch(() => toast.error("Failed to load section copy"))
      .finally(() => setLoading(false));
  }, []);

  const saveVisibility = async (next: VisibilityMap) => {
    setSavingMode(true);
    try {
      setVisibility(await updateAppearanceVisibility(next));
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message || "Failed to save clients visibility"
        : "Failed to save clients visibility";
      toast.error(message);
    } finally {
      setSavingMode(false);
    }
  };

  const patchVisibility = (next: VisibilityMap) => {
    setVisibility(next);
    void saveVisibility(next);
  };

  if (loading || clientsLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-ink-faint" />
      </div>
    );
  }

  const placementRows = CLIENTS_PLACEMENT_SWITCHES.map((meta) => ({
    ...meta,
    checked:
      meta.key === CLIENTS_VISIBILITY.GLOBAL
        ? globalMode
        : isVisible(visibility, meta.key),
    disabled:
      savingMode || (meta.key !== CLIENTS_VISIBILITY.GLOBAL && globalMode),
    onCheckedChange: (on: boolean) => {
      if (meta.key === CLIENTS_VISIBILITY.GLOBAL) {
        patchVisibility(setClientsGlobalMode(visibility, on));
        return;
      }
      patchVisibility({ ...visibility, [meta.key]: on });
    },
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients & partners"
        description="Shared logo list and section intro for Global, Home, and About. Use the switches below to control where they appear on the site."
      />

      <PreviewPanel
        section={PreviewSection.CLIENTS}
        placement="above"
        viewportHeight={320}
        draft={{
          clientsContent: { section },
          clientsList: items,
          appearance: { visibility },
        }}
        caption="The live Clients band (intro + logos), rendered by the website. Unsaved copy, logos and visibility show here before you save."
        sectionHidden={!sectionShown}
        onShowSection={() =>
          patchVisibility(setClientsGlobalMode(visibility, true))
        }
      >
        <SwitchOptionsCard
          title="Clients visibility"
          description="Where the shared logo list appears on the public site."
          rows={placementRows}
        />

        <SectionContentCard
          name="Clients"
          description="Shared intro copy for Global and page-specific placements. Leave a field empty to keep the placeholder."
          fields={CLIENTS_SECTION_FIELDS}
          content={section}
          onChange={setSection}
          onSave={cmsApi.updateClientsSection}
          visibilityKey={CLIENTS_SECTION_VISIBILITY_KEY}
          visibility={visibility}
          onVisibilityChange={setVisibility}
        />

        <ClientsLogosPanel
          items={items}
          loading={clientsLoading}
          onReload={reload}
        />
      </PreviewPanel>
    </div>
  );
};

export default ClientsManager;
