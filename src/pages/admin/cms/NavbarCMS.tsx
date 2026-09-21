import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { AdminInfoCallout } from "@/components/common";
import ListRow from "@/components/admin/ui/ListRow";
import SelectField from "@/components/admin/ui/SelectField";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import { PreviewSection } from "@/components/admin/ui/SitePreview";
import {
  VisibilityToggle,
  isVisible,
  type VisibilitySection,
} from "@/components/admin/ui/VisibilityToggle";
import { Button } from "@/components/ui/button";

import { DragList } from "@/lib/constants/drag-lists";
import {
  NAVBAR_VISIBILITY_GROUP,
  NavbarVisibilityKey,
} from "@/lib/constants/navbar";
import {
  navigationDestinationSelectOptions,
  withNavigationDestinationKey,
} from "@/lib/constants/navigation";
import { appearanceApi } from "@/services/api";
import type {
  AppearanceResponse,
  NavbarContent,
  NavbarItem,
} from "@/types/appearance";
import { move, patchAt } from "@/utils/utils";

export default function NavbarCMS() {
  const [data, setData] = useState<AppearanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchAppearance();
  }, []);

  const fetchAppearance = async () => {
    let message = "Failed to load the navbar";
    let isError = true;

    try {
      const response = await appearanceApi.get();

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setData(response.data.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
      }

      setLoading(false);
    }
  };

  const patchNavbar = (changes: Partial<NavbarContent>) =>
    setData((prev) =>
      prev ? { ...prev, navbar: { ...prev.navbar, ...changes } } : prev,
    );

  const patchVisibility = (key: string, visible: boolean) =>
    setData((prev) =>
      prev
        ? {
            ...prev,
            visibility: { ...(prev.visibility ?? {}), [key]: visible },
          }
        : prev,
    );

  const patchLink = (index: number, changes: Partial<NavbarItem>) =>
    setData((prev) => {
      if (!prev) return prev;
      const links = patchAt(prev.navbar.links, index, changes);
      return { ...prev, navbar: { ...prev.navbar, links } };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    let message = "Failed to save the navbar";
    let isError = true;

    setSaving(true);

    try {
      const response = await appearanceApi.update({
        navbar: data.navbar,
        visibility: data.visibility ?? {},
      });

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        message = "Navbar saved successfully";
        setData(response.data.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
      } else {
        toast.success(message);
      }

      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-ink-faint" />
      </div>
    );

  if (!data)
    return (
      <p className="text-sm text-ink-mute">
        The navbar is unavailable. Reload to try again.
      </p>
    );

  const { navbar, navbarRules: rules } = data;
  const navbarSections: VisibilitySection[] =
    data.visibilityOptions?.find(
      (group) => group.key === NAVBAR_VISIBILITY_GROUP,
    )?.sections ?? [];

  const elementToggle = (key: NavbarVisibilityKey) =>
    navbarSections.some((section) => section.key === key) ? (
      <VisibilityToggle
        visible={isVisible(data.visibility, key)}
        onChange={(visible) => patchVisibility(key, visible)}
      />
    ) : undefined;

  const ctaVisible = isVisible(data.visibility, NavbarVisibilityKey.CTA);
  const ctaDestinationDisabled =
    navbarSections.some((section) => section.key === NavbarVisibilityKey.CTA) &&
    !ctaVisible;

  const themeSection = navbarSections.find(
    (section) => section.key === NavbarVisibilityKey.THEME_TOGGLE,
  );

  return (
    <div className="space-y-6">
      <AdminInfoCallout
        description="Rename navigation items, choose which appear in the header, and set where the call-to-action goes. Paths are managed by the site — you pick destinations from a list. Which header STYLE renders them is set on the Appearance page."
        action={
          <Link
            to="/admin/site-identity/navigation"
            className="text-xs font-bold text-info underline underline-offset-2"
          >
            Change in Appearance
          </Link>
        }
      />

      <div>
        <h2 className="text-2xl font-bold text-ink">Navbar</h2>
        <p className="text-sm text-ink-mute mt-1">
          Navigation labels, visibility, order, and the header button
        </p>
      </div>

      <PreviewPanel
        section={PreviewSection.NAVBAR}
        placement="above"
        draft={{
          appearance: { navbar, visibility: data.visibility ?? {} },
        }}
        viewportHeight={340}
        caption="The live header, rendered by the website itself from what is typed here. Nothing is saved until you press Save."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionCard
            title="Navigation links"
            description="Drag to reorder. Hidden links stay saved but do not appear in the header or footer quick links."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {navbar.links.map((link, i) => (
                  <div
                    key={link.destinationKey}
                    className={
                      i === navbar.links.length - 1 &&
                      navbar.links.length % 2 === 1
                        ? "md:col-span-2"
                        : undefined
                    }
                  >
                    <ListRow
                      chrome="grip"
                      title={link.label || "Navigation link"}
                      index={i}
                      count={navbar.links.length}
                      listId={DragList.NAVBAR_LINKS}
                      onMove={(from, to) =>
                        patchNavbar({ links: move(navbar.links, from, to) })
                      }
                      onRemove={() => {}}
                      canRemove={false}
                      showRemove={false}
                    >
                      <InputField
                        label={`NavItem Label ${i + 1}`}
                        value={link.label}
                        onChange={(e) =>
                          patchLink(i, { label: e.target.value })
                        }
                        maxChars={rules.label.max}
                        labelAction={
                          <VisibilityToggle
                            visible={link.visible}
                            onChange={(visible) => patchLink(i, { visible })}
                          />
                        }
                      />
                    </ListRow>
                  </div>
                ))}
              </div>

              {themeSection && (
                <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-ink">
                      {themeSection.label}
                    </p>
                    {themeSection.helper && (
                      <p className="mt-0.5 text-xs text-ink-mute">
                        {themeSection.helper}
                      </p>
                    )}
                  </div>
                  {elementToggle(NavbarVisibilityKey.THEME_TOGGLE)}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Call-to-action button"
            description="The button beside the links, and its twin at the foot of the mobile menu."
            controls={elementToggle(NavbarVisibilityKey.CTA)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Button label"
                value={navbar.cta.label}
                onChange={(e) =>
                  patchNavbar({
                    cta: { ...navbar.cta, label: e.target.value },
                  })
                }
                maxChars={rules.ctaLabel.max}
              />
              <SelectField
                label="Destination"
                value={navbar.cta.destinationKey}
                options={navigationDestinationSelectOptions(
                  data.navigationDestinations,
                )}
                onValueChange={(value) => {
                  const next = withNavigationDestinationKey(
                    navbar.cta,
                    value,
                    data.navigationDestinations,
                  );
                  if (next) patchNavbar({ cta: next });
                }}
                disabled={ctaDestinationDisabled}
                tooltip="Where this button takes visitors. Internal pages and sections are chosen from the list — no paths to type."
              />
            </div>
          </SectionCard>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="submit"
              disabled={saving}
              startIcon={
                saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
            >
              Save Changes
            </Button>
          </div>
        </form>
      </PreviewPanel>
    </div>
  );
}
