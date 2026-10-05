import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import ClientsLogosPanel from "@/components/admin/clients/ClientsLogosPanel";
import { PageHeader } from "@/components/common";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import { PreviewSection } from "@/components/admin/ui/SitePreview";
import SectionContentCard from "@/components/admin/ui/SectionContentCard";
import ImageStyleCard from "@/components/admin/ui/ImageStyleCard";
import SwitchOptionsCard from "@/components/admin/ui/SwitchOptionsCard";
import {
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";

import { isAnyClientsPlacementOn } from "@/lib/clients-visibility";
import {
  CLIENTS_IMAGE_STYLE_OPTIONS,
  CLIENTS_PLACEMENT_SWITCHES,
  CLIENTS_SECTION_DEFAULTS,
  CLIENTS_SECTION_VISIBILITY_KEY,
  CLIENTS_VARIANT_DEFAULT,
  clientsSectionFields,
  CLIENTS_VISIBILITY,
} from "@/lib/constants/clients";
import { updateAppearanceVisibility } from "@/lib/utils/appearance";
import { useClientsList } from "@/hooks/use-clients-list";
import { appearanceApi, cmsApi } from "@/services/api";
import type { ClientsCopyRules, ClientsSectionContent } from "@/types/clients";
import type { ImageStyleMap, LayoutVariant } from "@/types/common";
import { ImageStyleSection } from "@/types/common";

const ClientsManager = () => {
  const { items, loading: clientsLoading, reload } = useClientsList();
  const [section, setSection] = useState<ClientsSectionContent>(
    CLIENTS_SECTION_DEFAULTS,
  );
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [clientsVariant, setClientsVariant] = useState<LayoutVariant>(
    CLIENTS_VARIANT_DEFAULT,
  );
  const [copyRules, setCopyRules] = useState<ClientsCopyRules | null>(null);
  const [imageStyles, setImageStyles] = useState<ImageStyleMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingMode, setSavingMode] = useState(false);

  const sectionShown = isAnyClientsPlacementOn(visibility);

  useEffect(() => {
    void (async () => {
      try {
        const [appearanceRes, sectionRes] = await Promise.all([
          appearanceApi.get(),
          cmsApi.getClientsSection(),
        ]);

        if (appearanceRes.data?.success) {
          const appearance = appearanceRes.data.data;
          setVisibility(appearance.visibility ?? {});
          setClientsVariant(
            appearance.clientsVariant ?? CLIENTS_VARIANT_DEFAULT,
          );
          setImageStyles(appearance.imageStyles);
        }

        if (sectionRes.data?.success) {
          const data = sectionRes.data.data;
          setSection({ title: data.title, description: data.description });
          if (data.rules) setCopyRules(data.rules);
        }
      } catch {
        toast.error(
          "Failed to load clients settings (is the backend running?)",
        );
      } finally {
        setLoading(false);
      }
    })();
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
    checked: isVisible(visibility, meta.key),
    disabled: savingMode,
    onCheckedChange: (on: boolean) => {
      patchVisibility({ ...visibility, [meta.key]: on });
    },
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients & partners"
        description="Shared logo list and section intro for Global, Home, and About. Layout style is on the Appearance tab."
      />

      <PreviewPanel
        section={PreviewSection.CLIENTS}
        placement="above"
        viewportHeight={320}
        draft={{
          clientsContent: { section },
          clientsList: items,
          appearance: {
            visibility,
            clientsVariant,
            ...(imageStyles && { imageStyles }),
          },
        }}
        caption="The live Clients band (intro + logos), rendered by the website. Unsaved copy, logos and visibility show here before you save."
        sectionHidden={!sectionShown}
        onShowSection={() =>
          patchVisibility({
            ...visibility,
            [CLIENTS_VISIBILITY.GLOBAL]: true,
            [CLIENTS_VISIBILITY.HOME]: true,
            [CLIENTS_VISIBILITY.ABOUT]: true,
          })
        }
      >
        <SwitchOptionsCard
          title="Clients visibility"
          description="Where the shared logo list appears on the public site."
          rows={placementRows}
        />

        {copyRules ? (
          <SectionContentCard
            name="Clients"
            description="Intro copy for Home and About placements. Helpers change with the layout selected under Appearance."
            fields={clientsSectionFields(copyRules)}
            content={section}
            onChange={setSection}
            onSave={cmsApi.updateClientsSection}
            visibilityKey={CLIENTS_SECTION_VISIBILITY_KEY}
            visibility={visibility}
            onVisibilityChange={setVisibility}
          />
        ) : null}

        {imageStyles ? (
          <ImageStyleCard
            section={ImageStyleSection.CLIENTS}
            description="Logo grid styling for Variant 2. Other variants ignore these switches."
            styles={imageStyles}
            onChange={setImageStyles}
            options={CLIENTS_IMAGE_STYLE_OPTIONS}
          />
        ) : null}

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
