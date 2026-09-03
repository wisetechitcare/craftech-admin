import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Loader2, Palette } from 'lucide-react';
import ImageDropzone from './ui/ImageDropzone';
import { cmsApi, uploadApi } from '../../services/api';

interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
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

const ROLES: [keyof ThemeColors, string][] = [
  ['primary', 'Primary'],
  ['primaryForeground', 'On Primary'],
  ['secondary', 'Secondary'],
  ['secondaryForeground', 'On Secondary'],
  ['accent', 'Accent'],
  ['accentForeground', 'On Accent'],
  ['background', 'Background'],
  ['surface', 'Surface'],
  ['foreground', 'Text'],
  ['muted', 'Muted Text'],
  ['border', 'Border'],
];

// The full strip. Background and foreground barely differ between options, but
// they are part of the theme and hiding them hides what is being chosen; the
// labels say which bar is which so a repeated colour reads as intentional.
const PREVIEW_ROLES: [keyof ThemeColors, string][] = [
  ['primary', 'Primary'],
  ['secondary', 'Secondary'],
  ['accent', 'Accent'],
  ['background', 'Background'],
  ['foreground', 'Text'],
];

const signature = (colors?: ThemeColors) =>
  colors ? `${colors.primary}|${colors.accent}|${colors.background}` : '';

export default function BrandingTab({ data, setData }: BrandingTabProps) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [options, setOptions] = useState<ThemeOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);

  const palette: string[] = data?.brandPalette?.colors || [];
  const theme: ThemeColors | undefined = data?.themeColors || undefined;

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

  const setRole = (role: keyof ThemeColors, value: string) => {
    if (!theme) return;
    setData({ ...data, themeColors: { ...theme, [role]: value } });
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
            The palette is the raw logo identity. The themes below are generated from it and checked for
            readable contrast &mdash; that is what the website actually renders.
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
                  <div className="flex gap-1.5 mb-3">
                    {PREVIEW_ROLES.map(([role, label]) => (
                      <span
                        key={role}
                        title={`${label} ${option.colors[role]}`}
                        className="h-8 flex-1 rounded-md border border-line"
                        style={{ background: option.colors[role] }}
                      />
                    ))}
                  </div>
                  <div
                    className="rounded-lg px-3 py-2.5 flex items-center gap-2"
                    style={{ background: option.colors.background, color: option.colors.foreground }}
                  >
                    <span className="text-xs font-semibold">Heading</span>
                    <span
                      className="text-[11px] font-semibold px-2 py-1 rounded-md"
                      style={{ background: option.colors.accent, color: option.colors.accentForeground }}
                    >
                      Get a quote
                    </span>
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
            <Palette className="w-3.5 h-3.5" /> Active theme
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ROLES.map(([role, label]) => (
              <label key={role} className="flex items-center gap-2.5 p-2.5 bg-raise border border-line rounded-lg">
                <input
                  type="color"
                  value={theme[role]}
                  onChange={(e) => setRole(role, e.target.value)}
                  className="w-8 h-8 rounded-md border border-line bg-transparent cursor-pointer"
                />
                <span className="text-xs">
                  <span className="block font-semibold text-ink">{label}</span>
                  <code className="text-ink-mute">{theme[role]}</code>
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-faint">
            Changes apply to the website once you save. Hand-edits are not contrast-checked &mdash; pick a
            generated theme if you want that guarantee.
          </p>
        </div>
      )}
    </div>
  );
}
