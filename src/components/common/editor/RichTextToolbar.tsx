import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Highlighter,
  Italic,
  type LucideIcon,
  RemoveFormatting,
  Strikethrough,
  Underline,
} from "lucide-react";

import SelectField from "@/components/admin/ui/SelectField";
import { Button } from "@/components/ui/button";
import GoogleFontSelector from "./GoogleFontSelector";
import { ColorPicker, ToolbarButton } from "./controls";

import {
  RICH_TEXT_DEFAULT_VALUE,
  fontSizeOptions,
  type RichTextConfig,
} from "@/lib/constants/rich-text";
import {
  TEXT_ALIGNMENTS,
  type RichTextDefaults,
  type RichTextFeature,
  type RichTextStyleAttributes,
  type TextAlignment,
} from "@/types/rich-text";

export interface RichTextToolbarProps {
  editor: Editor;
  features: readonly RichTextFeature[];
  config: RichTextConfig;
  defaults: RichTextDefaults;
  disabled?: boolean;
}

const TOGGLE_MARKS: {
  feature: RichTextFeature;
  label: string;
  icon: LucideIcon;
  command: "toggleBold" | "toggleItalic" | "toggleUnderline" | "toggleStrike";
  mark: string;
}[] = [
  {
    feature: "bold",
    label: "Bold",
    icon: Bold,
    command: "toggleBold",
    mark: "bold",
  },
  {
    feature: "italic",
    label: "Italic",
    icon: Italic,
    command: "toggleItalic",
    mark: "italic",
  },
  {
    feature: "underline",
    label: "Underline",
    icon: Underline,
    command: "toggleUnderline",
    mark: "underline",
  },
  {
    feature: "strike",
    label: "Strikethrough",
    icon: Strikethrough,
    command: "toggleStrike",
    mark: "strike",
  },
];

const ALIGNMENT_ICONS: Record<TextAlignment, LucideIcon> = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
};

const Divider = () => <span className="mx-1 h-5 w-px shrink-0 bg-gray-300" />;

/** The formatting ribbon. It renders exactly the controls a field's
 *  `allowedFeatures` permits and knows nothing about which field it sits on. */
export default function RichTextToolbar({
  editor,
  features,
  config,
  defaults,
  disabled = false,
}: RichTextToolbarProps) {
  const has = (feature: RichTextFeature) => features.includes(feature);
  const style = editor.getAttributes("textStyle") as RichTextStyleAttributes;

  // A collapsed cursor means "everything in this field". Tiptap would otherwise
  // hold the mark for the next character typed, which looks like a dead control.
  const scoped = () => {
    const chain = editor.chain().focus();
    return editor.state.selection.empty ? chain.selectAll() : chain;
  };

  // removeEmptyTextStyle drops the span once nothing is left on it, so falling
  // back to the inherited value leaves no trace in the stored document.
  const applyStyle = (attributes: RichTextStyleAttributes) =>
    scoped().setMark("textStyle", attributes).removeEmptyTextStyle().run();

  const clearFormatting = () => {
    const chain = scoped().unsetAllMarks();
    if (has("alignment")) chain.unsetTextAlign();
    chain.run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
      {has("fontFamily") && (
        <GoogleFontSelector
          value={style.fontFamily ?? null}
          inheritedFamily={defaults.fontFamily}
          disabled={disabled}
          className="w-44"
          onChange={(fontFamily) => applyStyle({ fontFamily })}
        />
      )}

      {has("fontSize") && (
        <span title="Font size">
          <SelectField
            aria-label="Font size"
            options={fontSizeOptions(defaults.fontSize)}
            value={style.fontSize ?? RICH_TEXT_DEFAULT_VALUE}
            disabled={disabled}
            className="ml-1"
            triggerClassName="h-8 w-28 gap-1 rounded border-gray-300 bg-white px-2 py-0 shadow-none"
            onValueChange={(value) =>
              applyStyle({
                fontSize: value === RICH_TEXT_DEFAULT_VALUE ? null : value,
              } as RichTextStyleAttributes)
            }
          />
        </span>
      )}

      {(has("fontFamily") || has("fontSize")) && <Divider />}

      {TOGGLE_MARKS.filter(({ feature }) => has(feature)).map(
        ({ label, icon: Icon, command, mark }) => (
          <ToolbarButton
            key={mark}
            label={label}
            icon={<Icon className="size-4" />}
            active={editor.isActive(mark)}
            disabled={disabled}
            onClick={() => scoped()[command]().run()}
          />
        ),
      )}

      {(has("textColor") || has("highlight")) && <Divider />}

      {has("textColor") && (
        <ColorPicker
          label="Text colour"
          icon={<Baseline className="size-4" />}
          swatches={config.colorSwatches}
          value={style.color ?? null}
          disabled={disabled}
          onChange={(color) => applyStyle({ color })}
        />
      )}

      {has("highlight") && (
        <ColorPicker
          label="Highlight colour"
          icon={<Highlighter className="size-4" />}
          swatches={config.highlightSwatches}
          value={style.backgroundColor ?? null}
          disabled={disabled}
          onChange={(backgroundColor) => applyStyle({ backgroundColor })}
        />
      )}

      {has("alignment") && (
        <>
          <Divider />
          {TEXT_ALIGNMENTS.map((alignment) => {
            const Icon = ALIGNMENT_ICONS[alignment];
            return (
              <ToolbarButton
                key={alignment}
                label={`Align ${alignment}`}
                icon={<Icon className="size-4" />}
                active={editor.isActive({ textAlign: alignment })}
                disabled={disabled}
                onClick={() => scoped().setTextAlign(alignment).run()}
              />
            );
          })}
        </>
      )}

      <Button
        size="xs"
        variant="outline"
        title="Remove every font, size and colour from this text"
        disabled={disabled}
        startIcon={<RemoveFormatting className="size-4" />}
        onMouseDown={(event) => event.preventDefault()}
        onClick={clearFormatting}
        className="ml-auto h-8 rounded border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 ring-0 hover:bg-gray-100"
      >
        Clear formatting
      </Button>
    </div>
  );
}
