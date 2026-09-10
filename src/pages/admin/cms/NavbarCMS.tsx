import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { AlertCircle, Loader2, Save } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import ListRow from "@/components/admin/ui/ListRow";
import {
  AddButton,
  HEADING,
  SectionCard,
} from "@/components/admin/ui/SectionCard";
import SitePreview, { PreviewSection } from "@/components/admin/ui/SitePreview";
import {
  ElementVisibility,
  type VisibilitySection,
} from "@/components/admin/ui/VisibilityToggle";

import { DragList } from "@/lib/constants/drag-lists";
import { appearanceApi } from "@/services/api";
import {
  EMPTY_NAV_LINK,
  type AppearanceResponse,
  type NavbarContent,
} from "@/types/appearance";
import { move, patchAt, removeAt } from "@/utils/utils";

/**
 * The site header's content and which of its parts are drawn.
 *
 * Both live on the Appearance record, so this page reads and writes that one
 * endpoint — which STYLE of header renders them stays on the Appearance page
 * with the Hero and About pickers, the same way About CMS edits copy while its
 * layout is chosen there.
 *
 * Link order IS the stored order: no order column and no per-row endpoint, so
 * dragging a row is a pure array transform that Save writes as one document.
 */
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

  // Merged into the map this page LOADED, never sent as the navbar keys alone:
  // the column is replaced whole on write, so a partial map would delete every
  // flag the About and Hero forms set.
  //
  // ponytail: last write wins across tabs — a section hidden in About CMS while
  // this page sat open is un-hidden by saving here. Same race About CMS already
  // has; the fix is a server-side merge of the map, worth doing the first time
  // two people actually edit at once.
  const patchVisibility = (key: string, visible: boolean) =>
    setData((prev) =>
      prev
        ? {
            ...prev,
            visibility: { ...(prev.visibility ?? {}), [key]: visible },
          }
        : prev,
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    let message = "Failed to save the navbar";
    let isError = true;

    setSaving(true);

    try {
      // Only the two fields this form owns. The layout switches are the
      // Appearance page's to write, and sending them from here would re-write
      // them from a copy that could be minutes stale.
      const response = await appearanceApi.update({
        navbar: data.navbar,
        visibility: data.visibility ?? {},
      });

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        message = "Navbar saved successfully";
        // Trust the server's copy over local state, so what the form shows
        // after a save is what was actually stored.
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
  // The server's catalogue for the header, not a list written here: a part
  // added to the registry appears with no change to this file, and nothing is
  // drawn that could not be saved.
  const navbarParts: VisibilitySection[] =
    data.visibilityOptions?.find((group) => group.key === "navbar")?.sections ??
    [];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-info shrink-0 mt-0.5" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-info">
          <span>
            The links and button the site header draws, on desktop and in the
            mobile menu alike. Which header STYLE renders them is set on the
            Appearance page. Updates reflect immediately (no redeploy needed).
          </span>
          <Link
            to="/admin/appearance"
            className="text-xs font-bold text-info underline underline-offset-2"
          >
            Change in Appearance
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-ink">Navbar</h2>
        <p className="text-sm text-ink-mute mt-1">
          Navigation links, the call-to-action button, and what the header shows
        </p>
      </div>

      {/* Full width and above the form, not in a side column like Hero and
          About: a header is wide and shallow, so SitePreview's 1440px viewport
          scales to something legible across the page and to a ribbon in a
          quarter of it. The short viewport keeps it to the bar and the top of
          the Hero behind it — every header variant is transparent until it is
          scrolled, so alone on an empty page there would be nothing to see. */}
      <div className="space-y-2">
        <h3 className={HEADING}>Preview</h3>
        <SitePreview
          section={PreviewSection.NAVBAR}
          draft={{
            appearance: { navbar, visibility: data.visibility ?? {} },
          }}
          viewportHeight={340}
        />
        <p className="text-[11px] text-ink-faint leading-relaxed">
          The live header, rendered by the website itself from what is typed
          here. Nothing is saved until you press Save.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard
          title="Navigation Links"
          description="Listed in the order below. Every layout draws the same links."
          count={navbar.links.length}
          max={rules.links.max}
          controls={
            <AddButton
              label="Add link"
              disabled={navbar.links.length >= rules.links.max}
              onClick={() =>
                patchNavbar({ links: [...navbar.links, EMPTY_NAV_LINK] })
              }
            />
          }
        >
          {navbar.links.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-xs text-ink-faint">
              No links. The header will draw the logo and the button only.
            </p>
          ) : (
            <div className="space-y-4">
              {navbar.links.map((link, i) => (
                <ListRow
                  key={i}
                  title="Link"
                  index={i}
                  count={navbar.links.length}
                  listId={DragList.NAVBAR_LINKS}
                  onMove={(from, to) =>
                    patchNavbar({ links: move(navbar.links, from, to) })
                  }
                  onRemove={(index) =>
                    patchNavbar({ links: removeAt(navbar.links, index) })
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Label"
                      value={link.label}
                      onChange={(e) =>
                        patchNavbar({
                          links: patchAt(navbar.links, i, {
                            label: e.target.value,
                          }),
                        })
                      }
                      maxChars={rules.label.max}
                    />
                    <InputField
                      label="Link"
                      value={link.href}
                      onChange={(e) =>
                        patchNavbar({
                          links: patchAt(navbar.links, i, {
                            href: e.target.value,
                          }),
                        })
                      }
                      maxChars={rules.href.max}
                      tooltip='A page ("/about"), a homepage section ("/#services") or a full web address.'
                    />
                  </div>
                </ListRow>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Call-to-action button"
          description="The button beside the links, and its twin at the foot of the mobile menu."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Button label"
              value={navbar.cta.label}
              onChange={(e) =>
                patchNavbar({ cta: { ...navbar.cta, label: e.target.value } })
              }
              maxChars={rules.ctaLabel.max}
            />
            <InputField
              label="Button link"
              value={navbar.cta.href}
              onChange={(e) =>
                patchNavbar({ cta: { ...navbar.cta, href: e.target.value } })
              }
              maxChars={rules.href.max}
            />
          </div>
        </SectionCard>

        {navbarParts.length > 0 && (
          <SectionCard
            title="What the header shows"
            description="Hidden parts keep their content, and hide on every screen size — desktop bar and mobile menu together."
          >
            <ElementVisibility
              elements={navbarParts}
              map={data.visibility ?? {}}
              sectionVisible
              onChange={patchVisibility}
            />
          </SectionCard>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => fetchAppearance()}
            className="px-6 py-2 text-ink border border-line rounded-lg font-bold text-sm hover:bg-paper transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-info text-white rounded-lg font-bold text-sm hover:bg-info disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Navbar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
