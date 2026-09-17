interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** A labelled on/off setting with a line saying what it does on the website. */
const ToggleField = ({
  label,
  description,
  checked,
  onChange,
}: ToggleFieldProps) => (
  <label className="flex items-start gap-3 cursor-pointer p-3 bg-raise rounded-lg hover:bg-paper transition-colors">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 w-4 h-4 rounded border-line"
    />
    <span>
      <span className="block text-sm font-medium text-ink">{label}</span>
      {description && (
        <span className="block mt-0.5 text-xs text-ink-mute">
          {description}
        </span>
      )}
    </span>
  </label>
);

export default ToggleField;
