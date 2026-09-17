import InputField from "@/components/admin/ui/InputField";
import { SectionCard } from "@/components/admin/ui/SectionCard";

import {
  BUSINESS_DAYS,
  DEFAULT_OPEN_HOURS,
  type BusinessDay,
} from "@/lib/constants/settings";
import type { DayHours, SettingsTabProps } from "@/types/settings";

const CLOSED: DayHours = { isOpen: false };

const BusinessHoursFields = ({ data, errors, patch }: SettingsTabProps) => {
  const hours = data.businessHours ?? {};

  const patchDay = (day: BusinessDay, changes: Partial<DayHours>) => {
    const current = hours[day] ?? CLOSED;
    const opening = changes.isOpen && !current.isOpen;
    patch({
      businessHours: {
        ...hours,
        [day]: {
          ...current,
          ...(opening && !current.open && !current.close
            ? DEFAULT_OPEN_HOURS
            : {}),
          ...changes,
        },
      },
    });
  };

  return (
    <SectionCard
      title="Business hours"
      description="Optional. Shown in the contact section. Leave every day closed to show no hours at all."
    >
      <div className="space-y-2">
        {BUSINESS_DAYS.map((day) => {
          const { open = "", close = "", isOpen } = hours[day] ?? CLOSED;
          const error = errors[`businessHours.${day}`];

          return (
            <div key={day} className="p-3 bg-raise rounded-lg">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-24 text-sm font-semibold text-ink capitalize">
                  {day}
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) =>
                      patchDay(day, { isOpen: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-line"
                  />
                  <span className="text-xs text-ink-mute">
                    {isOpen ? "Open" : "Closed"}
                  </span>
                </label>
                {isOpen && (
                  <div className="flex flex-1 items-center gap-2 min-w-60">
                    <div className="flex-1">
                      <InputField
                        type="time"
                        aria-label={`${day} opening time`}
                        value={open}
                        onChange={(e) =>
                          patchDay(day, { open: e.target.value })
                        }
                        error={!!error}
                      />
                    </div>
                    <span className="text-ink-mute text-sm">to</span>
                    <div className="flex-1">
                      <InputField
                        type="time"
                        aria-label={`${day} closing time`}
                        value={close}
                        onChange={(e) =>
                          patchDay(day, { close: e.target.value })
                        }
                        error={!!error}
                      />
                    </div>
                  </div>
                )}
              </div>
              {error && <p className="mt-2 text-xs text-error-500">{error}</p>}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};

export default BusinessHoursFields;
