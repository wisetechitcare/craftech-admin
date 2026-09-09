import React, { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { AlertCircle, Loader2, Plus, Save } from "lucide-react";

import InputField from "../../../components/admin/ui/InputField";
import ListRow from "../../../components/admin/ui/ListRow";
import {
  ElementVisibility,
  type VisibilitySection,
} from "../../../components/admin/ui/VisibilityToggle";

import { appearanceApi } from "../../../services/api";
import {
  EMPTY_NAV_LINK,
  type AppearanceResponse,
  type NavbarContent,
  type NavbarRules,
} from "../../../types/appearance";
import { move, patchAt, removeAt } from "../../../utils/utils";

const CARD = "bg-paper border border-line rounded-xl p-6 space-y-5";
const HEADING = "text-sm font-semibold text-ink uppercase tracking-wider";

interface NavbarFieldsProps {
  navbar: NavbarContent;
  rules: NavbarRules;
  onChange: (changes: Partial<NavbarContent>) => void;
}

/**
 * The header's own content: which links it lists, in what order, and the button
 * beside them. Order IS the stored order — no order column and no per-row
 * endpoint, so every edit here is a pure array transform that Save writes as one
 * document.
 *
 * Character caps come from the server's `navbarRules`, never from numbers typed
 * here, so the counters and the validation can never drift apart.
 */
const NavbarFields = ({ navbar, rules, onChange }: NavbarFieldsProps) => (
  <div className="space-y-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="block text-xs font-semibold text-ink-mute uppercase tracking-wider">
          Navigation Links
        </span>
        <p className="mt-1 text-xs text-ink-faint">
          Listed in the order below. Every layout draws the same links.
        </p>
      </div>
      <button
        type="button"
        onClick={() => onChange({ links: [...navbar.links, EMPTY_NAV_LINK] })}
        disabled={navbar.links.length >= rules.links.max}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line text-xs font-bold text-ink hover:bg-raise disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add link
      </button>
    </div>

    {navbar.links.length === 0 ? (
      <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-xs text-ink-faint">
        No links. The header will draw the logo and the button only.
      </p>
    ) : (
      <div className="space-y-3">
        {navbar.links.map((link, i) => (
          <ListRow
            key={i}
            title="Link"
            index={i}
            count={navbar.links.length}
            onMove={(from, to) =>
              onChange({ links: move(navbar.links, from, to) })
            }
            onRemove={(index) =>
              onChange({ links: removeAt(navbar.links, index) })
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Label"
                value={link.label}
                onChange={(e) =>
                  onChange({
                    links: patchAt(navbar.links, i, { label: e.target.value }),
                  })
                }
                maxChars={rules.label.max}
              />
              <InputField
                label="Link"
                value={link.href}
                onChange={(e) =>
                  onChange({
                    links: patchAt(navbar.links, i, { href: e.target.value }),
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

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
      <InputField
        label="Button label"
        value={navbar.cta.label}
        onChange={(e) =>
          onChange({ cta: { ...navbar.cta, label: e.target.value } })
        }
        maxChars={rules.ctaLabel.max}
        tooltip="The button beside the links, and its twin at the foot of the mobile menu."
      />
      <InputField
        label="Button link"
        value={navbar.cta.href}
        onChange={(e) =>
          onChange({ cta: { ...navbar.cta, href: e.target.value } })
        }
        maxChars={rules.href.max}
      />
    </div>
  </div>
);

/**
 * The site header's content and which of its parts are drawn.
 *
 * Both live on the Appearance record, so this page reads and writes that one
 * endpoint — which STYLE of header renders them stays on the Appearance page
 * with the Hero and About pickers, the same way About CMS edits copy while its
 * layout is chosen there.
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

  // The server's catalogue for the header, not a list written here: a part
  // added to the registry appears with no change to this file, and nothing is
  // drawn that could not be saved.
  const navbarParts: VisibilitySection[] =
    data?.visibilityOptions?.find((group) => group.key === "navbar")
      ?.sections ?? [];

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

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm text-info">
          The links and button the site header draws, on desktop and in the
          mobile menu alike. Which header STYLE renders them is set on the
          Appearance page. Updates reflect immediately (no redeploy needed).
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-ink">Navbar</h2>
        <p className="text-sm text-ink-mute mt-1">
          Navigation links, the call-to-action button, and what the header shows
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {data && (
          <>
            <div className={CARD}>
              <h3 className={HEADING}>Navbar Content</h3>
              <NavbarFields
                navbar={data.navbar}
                rules={data.navbarRules}
                onChange={patchNavbar}
              />
            </div>

            {navbarParts.length > 0 && (
              <div className={CARD}>
                <div>
                  <h3 className={HEADING}>What the header shows</h3>
                  <p className="mt-1 text-xs text-ink-faint">
                    Hidden parts keep their content, and hide on every screen
                    size — desktop bar and mobile menu together.
                  </p>
                </div>
                <ElementVisibility
                  elements={navbarParts}
                  map={data.visibility ?? {}}
                  sectionVisible
                  onChange={patchVisibility}
                />
              </div>
            )}
          </>
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
