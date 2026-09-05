import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Loader2, Palette } from 'lucide-react';
import ImageDropzone from './ui/ImageDropzone';
import { cmsApi, uploadApi } from '../../services/api';

// Mirrors src/domain/theme/types.ts. The identity is the only thing the admin
// edits; both token sets below are derived from it by the server on save.
interface BrandIdentity {
  primary: string;
  secondary: string;
  accent: string;
}

interface SemanticTokens {
  page: string;
  surface: string;
  surface2: string;
  ink: string;
  muted: string;
  line: string;
  brand: string;
  onBrand: string;
  brand2: string;
  onBrand2: string;
  accent: string;
  onAccent: string;
}

interface ThemeColors {
  brand: BrandIdentity;
  light: SemanticTokens;
  dark: SemanticTokens;
}

interface ThemeOption {
  id: string;
  label: string;
  colors: ThemeColors;
}

interface BrandingTabProps {
  data: any;
  setData: (next: any) => void;
}

// The three colours a human would point at in the logo. Editing one regenerates
// every semantic token in both modes — which is why these are the only pickers
// on this screen. A hand-edited `muted` used to ship straight to the website
// with no contrast check behind it.
const IDENTITY_ROLES: [keyof BrandIdentity, string][] = [
  ['primary', 'Primary'],
  ['secondary', 'Secondary'],
  ['accent', 'Accent'],
];

// The bars a human actually reads when comparing options — one row per mode, so
// the dark system is visible before it ships rather than after a bug report.
const PREVIEW_ROLES: [keyof SemanticTokens, string][] = [
  ['brand', 'Brand'],
  ['brand2', 'Brand 2'],
  ['accent', 'Accent'],
  ['page', 'Page'],
  ['ink', 'Text'],
];

const signature = (colors?: ThemeColors) =>
  colors ? `${colors.brand.primary}|${colors.brand.accent}` : '';

// One mode's strip plus a live sample of the pairing the site paints most often:
// a heading and a CTA on the canvas. Rendered for both modes because "readable
// on white" was never the same promise as "readable".
const ModeStrip = ({ tokens, label }: { tokens: SemanticTokens; label: string }) => (
  <div className="space-y-1.5">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</span>
    <div className="flex gap-1.5">
      {PREVIEW_ROLES.map(([role, roleLabel]) => (
        <span
          key={role}
          title={`${roleLabel} ${tokens[role]}`}
          className="h-6 flex-1 rounded-md border border-line"
          style={{ background: tokens[role] }}
        />
      ))}
    </div>
    <div
      className="rounded-lg px-3 py-2.5 flex items-center gap-2 border"
      style={{ background: tokens.page, color: tokens.ink, borderColor: tokens.line }}
    >
      <span className="text-xs font-semibold">Heading</span>
      <span className="text-[11px]" style={{ color: tokens.muted }}>
        supporting copy
      </span>
      <span
        className="text-[11px] font-semibold px-2 py-1 rounded-md ml-auto"
        style={{ background: tokens.accent, color: tokens.onAccent }}
      >
        Get a quote
      </span>
    </div>
  </div>
);

export default function BrandingTab({ data, setData }: BrandingTabProps) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [options, setOptions] = useState<ThemeOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);

  const palette: string[] = data?.brandPalette?.colors || [];
  const theme: ThemeColors | undefined = data?.themeColors?.brand ? data.themeColors : undefined;

  // Options are regenerated from the saved palette, so revisiting this tab shows
  // the same choices without re-uploading the logo.
  useEffect(() => {
    if (!palette.length || options.length) return;
    setLoadingOptions(true);
    cmsApi
      .getThemeOptions()
      .then((res) => setOptions(res.data.data || []))
      .catch(() => toast.error('Failed to load theme options'))
      .finally(() => setLoadingOptions(false));
  }, [palette.length, options.length]);

  const handleLogo = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await uploadApi.logo(formData);
      const { url, palette: extracted, themeOptions } = res.data.data;

      setOptions(themeOptions || []);
      setData({
        ...data,
        logoUrl: url,
        brandPalette: extracted,
        // Land on a usable theme rather than a palette and no theme.
        themeColors: themeOptions?.[0]?.colors ?? data?.themeColors,
      });
      toast.success(`Extracted ${extracted.colors.length} colours from the logo`);
    } catch {
      toast.error('Logo upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Only the identity is sent; the server rebuilds both token sets from it, so
  // the strips below stay stale until save. That is deliberate — the preview a
  // human trusts has to be the one the generator produced, not one the browser
  // guessed at with a second copy of the colour maths.
  const setIdentity = (role: keyof BrandIdentity, value: string) => {
    if (!theme) return;
    setData({ ...data, themeColors: { ...theme, brand: { ...theme.brand, [role]: value.toUpperCase() } } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-ink mb-1">Logo &amp; Theme</h3>
        <p className="text-sm text-ink-mute">
          Upload a logo to extract its brand colours, then pick the theme the website renders with.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageDropzone
          multiple={false}
          label="Drop your logo here"
          uploading={uploading}
          onUpload={handleLogo}
        />
        {data?.logoUrl && (
          <div className="flex flex-col items-center justify-center gap-3 p-6 bg-raise border border-line rounded-2xl">
            <img src={data.logoUrl} alt="Current logo" className="max-h-24 object-contain" />
            <span className="text-xs text-ink-mute uppercase tracking-wider">Current logo</span>
          </div>
        )}
      </div>

      {palette.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-ink-mute uppercase tracking-wider">Extracted palette</p>
          <div className="flex flex-wrap gap-3">
            {palette.map((color) => (
              <div key={color} className="flex items-center gap-2 px-3 py-2 bg-raise border border-line rounded-lg">
                <span className="w-6 h-6 rounded-md border border-line" style={{ background: color }} />
                <code className="text-xs text-ink-soft">{color}</code>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-faint">
            The palette is the raw logo identity. Each theme below generates a light and a dark system from
            it, every pairing checked for readable contrast against the surface it actually lands on.
          </p>
        </div>
      )}

      {loadingOptions && <Loader2 className="w-5 h-5 animate-spin text-ink-faint" />}

      {options.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-ink-mute uppercase tracking-wider">Theme options</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((option) => {
              const selected = signature(option.colors) === signature(theme);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setData({ ...data, themeColors: option.colors })}
                  className={`text-left p-4 rounded-xl border transition-colors ${
                    selected ? 'border-info bg-info/5' : 'border-line hover:bg-raise'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-ink">{option.label}</span>
                    {selected && <Check className="w-4 h-4 text-info" />}
                  </div>
                  <div className="space-y-3">
                    <ModeStrip tokens={option.colors.light} label="Light" />
                    <ModeStrip tokens={option.colors.dark} label="Dark" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {theme && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-ink-mute uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" /> Brand identity
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {IDENTITY_ROLES.map(([role, label]) => (
              <label key={role} className="flex items-center gap-2.5 p-2.5 bg-raise border border-line rounded-lg">
                <input
                  type="color"
                  value={theme.brand[role]}
                  onChange={(e) => setIdentity(role, e.target.value)}
                  className="w-8 h-8 rounded-md border border-line bg-transparent cursor-pointer"
                />
                <span className="text-xs">
                  <span className="block font-semibold text-ink">{label}</span>
                  <code className="text-ink-mute">{theme.brand[role]}</code>
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-faint">
            These three colours are the brand. Every other colour on the website &mdash; page, surface, text,
            muted text, borders, buttons, in both light and dark mode &mdash; is regenerated from them when
            you save, so none of them can be edited into something unreadable.
          </p>
        </div>
      )}
    </div>
  );
}
