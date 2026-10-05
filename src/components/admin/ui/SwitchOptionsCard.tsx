import type { ReactNode } from "react";

import { SectionCard } from "@/components/admin/ui/SectionCard";
import { Switch } from "@/components/ui/switch";

export interface SwitchOptionRow {
  key: string;
  label: string;
  helper: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

interface SwitchOptionsCardProps {
  title: string;
  description: string;
  rows: SwitchOptionRow[];
  actions?: ReactNode;
}

/** Bordered switch list (Gallery Image Style, Clients placement, etc.). */
const SwitchOptionsCard = ({
  title,
  description,
  rows,
  actions,
}: SwitchOptionsCardProps) => (
  <SectionCard title={title} description={description}>
    <div className="divide-y divide-line rounded-lg border border-line px-4">
      {rows.map(
        ({ key, label, helper, checked, disabled, onCheckedChange }) => (
          <label
            key={key}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink">{label}</div>
              <p className="mt-0.5 text-xs text-ink">{helper}</p>
            </div>
            <Switch
              checked={checked}
              disabled={disabled}
              onCheckedChange={onCheckedChange}
            />
          </label>
        ),
      )}
    </div>
    {actions && <div className="flex justify-end">{actions}</div>}
  </SectionCard>
);

export default SwitchOptionsCard;
