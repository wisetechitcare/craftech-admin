import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/common";
import ImageStyleCard from "@/components/admin/ui/ImageStyleCard";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import SectionContentCard from "@/components/admin/ui/SectionContentCard";
import { PreviewSection } from "@/components/admin/ui/SitePreview";
import {
  SectionVisibilitySwitch,
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";
import ProjectFieldsCard from "./ProjectFieldsCard";

import { PORTFOLIO_IMAGE_STYLE_OPTIONS } from "@/lib/constants/portfolio/image-style";
import {
  PORTFOLIO_SECTION_FIELDS,
  PORTFOLIO_VISIBILITY_KEY,
  type PortfolioSectionCopy,
} from "@/lib/constants/portfolio";
import {
  PROJECT_CARD_FIELD_LIMIT,
  PROJECT_FIELD_LABEL_MAX,
  PROJECT_FIELD_LIMIT,
} from "@/lib/constants/projects";
import { appearanceApi, portfolioSectionApi } from "@/services/api";
import { ImageStyleSection, type ImageStyleMap } from "@/types/common";
import type { PortfolioSectionContent } from "@/types/portfolio";

/** Keep projectDetail in sync so caption tooling still reads the same flags. */
const withSyncedProjectDetail = (styles: ImageStyleMap): ImageStyleMap => ({
  ...styles,
  [ImageStyleSection.PROJECT_DETAIL]: {
    ...styles[ImageStyleSection.PROJECT_DETAIL],
    ...styles[ImageStyleSection.PORTFOLIO],
  },
});

const ProjectsSectionPanel = () => {
  const [section, setSection] = useState<PortfolioSectionContent>({
    eyebrow: "",
    title: "",
    description: "",
    viewAllLabel: "",
  });
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [imageStyles, setImageStyles] = useState<ImageStyleMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingFields, setSavingFields] = useState<boolean>(false);

  const sectionVisible = isVisible(visibility, PORTFOLIO_VISIBILITY_KEY);
  const sectionCopy: PortfolioSectionCopy = {
    eyebrow: section.eyebrow,
    title: section.title,
    description: section.description,
    viewAllLabel: section.viewAllLabel,
  };

  const saveFields = async () => {
    const fields = section.fields ?? [];
    if (fields.length > PROJECT_FIELD_LIMIT) {
      toast.error(
        `A website can configure at most ${PROJECT_FIELD_LIMIT} project fields`,
      );
      return;
    }
    if (
      fields.some(
        (field) =>
          !field.label.trim() ||
          field.label.trim().length > PROJECT_FIELD_LABEL_MAX,
      )
    ) {
      toast.error(
        `Field labels must be 1–${PROJECT_FIELD_LABEL_MAX} characters`,
      );
      return;
    }
    if (
      fields.filter((field) => field.enabled && field.showOnCard).length >
      PROJECT_CARD_FIELD_LIMIT
    ) {
      toast.error(
        `At most ${PROJECT_CARD_FIELD_LIMIT} fields can be shown on project cards`,
      );
      return;
    }
    setSavingFields(true);
    let message = "Failed to save project fields";
    let isError = true;
    try {
      const response = await portfolioSectionApi.updateSection(section);
      message = response.data?.message || "Project fields saved";
      if (response.data?.success) {
        isError = false;
        setSection(response.data.data);
      }
    } catch {
      message = "Failed to save project fields";
    } finally {
      toast[isError ? "error" : "success"](message);
      setSavingFields(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [sectionRes, appearanceRes] = await Promise.all([
          portfolioSectionApi.getSection(),
          appearanceApi.get(),
        ]);
        if (sectionRes.data?.success) {
          setSection(sectionRes.data.data);
        }
        if (appearanceRes.data?.success) {
          setVisibility(appearanceRes.data.data.visibility ?? {});
          setImageStyles(appearanceRes.data.data.imageStyles);
        }
      } catch {
        toast.error("Failed to load projects section settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects CMS"
        description="Section copy, visibility and image style. Layout style is on the Appearance tab. Project entries are managed in the list below."
        action={
          <SectionVisibilitySwitch
            visible={sectionVisible}
            onChange={(visible) =>
              setVisibility((prev) => ({
                ...prev,
                [PORTFOLIO_VISIBILITY_KEY]: visible,
              }))
            }
          />
        }
      />

      <PreviewPanel
        section={PreviewSection.PORTFOLIO}
        placement="above"
        draft={{
          portfolioSection: section,
          appearance: { visibility, ...(imageStyles && { imageStyles }) },
        }}
        sectionHidden={!sectionVisible}
        onShowSection={() =>
          setVisibility((prev) => ({
            ...prev,
            [PORTFOLIO_VISIBILITY_KEY]: true,
          }))
        }
      >
        {imageStyles ? (
          <ImageStyleCard
            section={ImageStyleSection.PORTFOLIO}
            description="List thumbnails and detail photos. Inline gallery puts every photo below the project copy."
            styles={imageStyles}
            onChange={(next) => setImageStyles(withSyncedProjectDetail(next))}
            options={PORTFOLIO_IMAGE_STYLE_OPTIONS}
          />
        ) : null}

        <SectionContentCard
          name="Projects"
          description="Shown above the project cards on the homepage. Leave a field empty to use the site default."
          fields={PORTFOLIO_SECTION_FIELDS}
          content={sectionCopy}
          onChange={(content) =>
            setSection((current) => ({ ...current, ...content }))
          }
          onSave={async (content) => {
            const response = await portfolioSectionApi.updateSection(content);
            const saved = response.data.data;
            return {
              ...response,
              data: {
                ...response.data,
                data: {
                  eyebrow: saved.eyebrow,
                  title: saved.title,
                  description: saved.description,
                  viewAllLabel: saved.viewAllLabel,
                },
              },
            };
          }}
          visibilityKey={PORTFOLIO_VISIBILITY_KEY}
          visibility={visibility}
          onVisibilityChange={setVisibility}
        />

        <ProjectFieldsCard
          fields={section.fields ?? []}
          onChange={(fields) =>
            setSection((current) => ({ ...current, fields }))
          }
          onSave={saveFields}
          saving={savingFields}
        />
      </PreviewPanel>
    </div>
  );
};

export default ProjectsSectionPanel;
