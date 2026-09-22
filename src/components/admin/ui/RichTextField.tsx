import { useEffect, useMemo, useRef, type ReactNode } from "react";
import type { FieldError } from "react-hook-form";
import { EditorContent, useEditor } from "@tiptap/react";

import { RichTextToolbar } from "@/components/common/editor";
import { SelectFieldWrapper } from "./SelectField";

import { useGoogleFontStyles } from "@/hooks";
import {
  DEFAULT_RICH_TEXT_CONFIG,
  type RichTextConfig,
} from "@/lib/constants/rich-text";
import {
  collectFontUsage,
  createRichTextExtensions,
  richTextToPlain,
  toRichText,
} from "@/lib/editor";
import type {
  RichTextDefaults,
  RichTextDocument,
  RichTextFeature,
  RichTextValue,
} from "@/types/rich-text";
import { cn } from "@/utils/utils";

export interface RichTextFieldProps {
  /** A document, or the plain string a field held before it became rich text. */
  value: RichTextValue;
  onChange: (value: RichTextDocument) => void;
  /** Which controls this field offers. Must match what the server accepts. */
  allowedFeatures?: readonly RichTextFeature[];
  /** The typography this field inherits, named in the toolbar in place of the
   *  word "Default". */
  defaults: RichTextDefaults;
  config?: RichTextConfig;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: boolean | FieldError;
  hint?: ReactNode;
  /** Counts PLAIN characters, the budget the server enforces. */
  maxChars?: number;
  tooltip?: ReactNode;
  labelAction?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * The CMS's formatted-text field. Label, error, hint and counter behave exactly
 * as on InputField, so it drops into an existing form the same way — every
 * module that needs formatted copy imports this and passes props.
 */
export default function RichTextField({
  value,
  onChange,
  allowedFeatures,
  defaults,
  config = DEFAULT_RICH_TEXT_CONFIG,
  placeholder,
  label,
  required = false,
  error,
  hint,
  maxChars,
  tooltip,
  labelAction,
  disabled = false,
  className,
}: RichTextFieldProps) {
  const features = allowedFeatures ?? config.features;
  const content = useMemo(() => toRichText(value), [value]);

  useGoogleFontStyles(useMemo(() => collectFontUsage(content), [content]));

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // What this editor last emitted. The value coming back down is normally that
  // same document echoed by the parent, and re-seeding on it would reset the
  // cursor on every keystroke.
  const lastEmitted = useRef<string>("");

  // Keyed on the feature NAMES, not the array. A save hands back a fresh
  // `textFeatures` array; keying on identity tore the editor down mid-render
  // and blanked the page.
  const featureKey = features.join(",");

  const editor = useEditor(
    {
      editable: !disabled,
      shouldRerenderOnTransaction: true,
      extensions: createRichTextExtensions({
        features,
        placeholder: placeholder ?? config.placeholder,
      }),
      content,
      editorProps: {
        attributes: {
          class:
            "min-h-20 w-full px-4 py-3 text-sm text-ink focus:outline-hidden",
        },
      },
      onUpdate: ({ editor: instance }) => {
        const json = instance.getJSON() as RichTextDocument;
        lastEmitted.current = JSON.stringify(json);
        onChangeRef.current(json);
      },
    },
    [featureKey, placeholder],
  );

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const incoming = JSON.stringify(content);
    if (incoming === lastEmitted.current) return;
    lastEmitted.current = incoming;
    editor.commands.setContent(content, { emitUpdate: false });
  }, [editor, content]);

  useEffect(() => {
    if (editor && !editor.isDestroyed) editor.setEditable(!disabled);
  }, [editor, disabled]);

  const length = richTextToPlain(content).length;
  const over = maxChars !== undefined && length > maxChars;
  const hasError =
    over || (typeof error === "boolean" ? error : Boolean(error));
  const resolvedHint =
    hint ?? (typeof error === "object" && error ? error.message : undefined);

  return (
    <SelectFieldWrapper
      label={label}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction}
      hasError={hasError}
      className={className}
    >
      <div
        className={cn(
          "overflow-hidden rounded-lg border shadow-theme-xs transition-colors",
          disabled &&
            "cursor-not-allowed border-gray-300 bg-gray-100 opacity-40",
          !disabled && hasError && "border-error-500",
          !disabled && !hasError && "border-gray-300 bg-paper",
        )}
      >
        {editor && (
          <RichTextToolbar
            editor={editor}
            features={features}
            config={config}
            defaults={defaults}
            disabled={disabled}
          />
        )}
        <EditorContent editor={editor} />
      </div>

      {(resolvedHint || maxChars !== undefined) && (
        <div className="mt-1.5 flex justify-between gap-3">
          <p
            className={cn(
              "text-xs leading-relaxed",
              hasError ? "text-error-500" : "text-gray-500",
            )}
          >
            {resolvedHint}
          </p>
          {maxChars !== undefined && (
            <span
              className={cn(
                "shrink-0 text-xs font-semibold tabular-nums",
                over ? "text-error-500" : "text-gray-500",
              )}
            >
              {length} / {maxChars}
            </span>
          )}
        </div>
      )}
    </SelectFieldWrapper>
  );
}
