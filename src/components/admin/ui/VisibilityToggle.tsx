import { Eye, EyeOff } from 'lucide-react';

/**
 * The Visible/Hidden controls, shaped by the catalogue the API serves with the
 * Appearance record (`visibilityOptions`, from the backend's
 * src/domain/visibility/registry.ts).
 *
 * Nothing about a page is hardcoded here: a CMS form looks up its own group's
 * sections by key and renders whatever the server says it can control, so a
 * section added on the server appears with no change to the admin bundle. The
 * flag itself lives on `appearance.visibility` — hiding a block never touches
 * the content behind it, which comes back exactly as it was.
 */
export interface VisibilityElement {
  key: string;
  label: string;
  helper?: string;
}

export interface VisibilitySection extends VisibilityElement {
  elements?: VisibilityElement[];
}

export type VisibilityMap = Record<string, boolean>;

/** Absent means visible — the server's read contract, restated so an untouched
 *  key shows as Visible instead of as a switch with nothing behind it. */
export const isVisible = (map: VisibilityMap | null | undefined, key: string) => map?.[key] !== false;

interface VisibilityToggleProps {
  visible: boolean;
  disabled?: boolean;
  onChange: (visible: boolean) => void;
}

/** The switch. It prints the word rather than only flipping a track: "Visible"
 *  and "Hidden" say what the live site does, where on/off leaves an admin
 *  working out which way round it is. */
export const VisibilityToggle = ({ visible, disabled, onChange }: VisibilityToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={visible}
    disabled={disabled}
    onClick={() => onChange(!visible)}
    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
      visible ? 'border-info/50 bg-info/10 text-info' : 'border-line bg-raise text-ink-mute'
    }`}
  >
    {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
    {/* Fixed width so the card header does not jump as the word changes. */}
    <span className="w-9 text-left">{visible ? 'Visible' : 'Hidden'}</span>
  </button>
);

interface ElementVisibilityProps {
  elements: VisibilityElement[];
  map: VisibilityMap;
  sectionVisible: boolean;
  onChange: (key: string, visible: boolean) => void;
}

/** The optional pieces inside one section, listed at the foot of its card.
 *  A hidden section takes all of them with it, so their switches disable
 *  rather than sit there looking live; the stored values are untouched and
 *  return exactly as they were when the section is shown again. */
export const ElementVisibility = ({ elements, map, sectionVisible, onChange }: ElementVisibilityProps) => (
  <div className="rounded-lg border border-line bg-raise/50 px-4">
    <p className="pt-2.5 text-[10px] font-bold text-ink-faint uppercase tracking-wider">Inside this section</p>
    <div className="divide-y divide-line">
      {elements.map((element) => (
        <div key={element.key} className="flex items-center justify-between gap-4 py-2.5">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-ink">{element.label}</div>
            {element.helper && <p className="mt-0.5 text-[11px] text-ink-faint">{element.helper}</p>}
          </div>
          <VisibilityToggle
            visible={sectionVisible && isVisible(map, element.key)}
            disabled={!sectionVisible}
            onChange={(visible) => onChange(element.key, visible)}
          />
        </div>
      ))}
    </div>
  </div>
);
