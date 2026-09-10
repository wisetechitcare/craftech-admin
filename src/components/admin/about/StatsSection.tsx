import InputField from "@/components/admin/ui/InputField";
import ListRow from "@/components/admin/ui/ListRow";

import { AddButton, SectionCard, type AboutSectionProps } from "./shared";

import { AboutSectionKey } from "@/lib/constants/about";
import { DragList } from "@/lib/constants/drag-lists";
import { EMPTY_STAT } from "@/types/about";
import { move, patchAt, removeAt } from "@/utils/utils";

/** The metrics band. */
const StatsSection = ({
  content,
  rules,
  errors,
  patch,
  toggle,
  elementToggles,
}: AboutSectionProps) => {
  const { stats } = content;

  return (
    <SectionCard
      title="Stats"
      description={
        'The metrics band. Type the value exactly as it should read, e.g. "25+".'
      }
      count={stats.length}
      max={rules.lists.stats.max}
      controls={
        <div className="flex items-center gap-3">
          {toggle(AboutSectionKey.STATS)}
          <AddButton
            label="Add Stat"
            disabled={stats.length >= rules.lists.stats.max}
            onClick={() => patch({ stats: [...stats, { ...EMPTY_STAT }] })}
          />
        </div>
      }
    >
      {errors.stats && (
        <p className="text-[11px] text-danger">{errors.stats}</p>
      )}
      <div className="space-y-4">
        {stats.map((stat, i) => (
          <ListRow
            key={i}
            title="Stat"
            index={i}
            count={stats.length}
            listId={DragList.ABOUT_STATS}
            onMove={(from, to) => patch({ stats: move(stats, from, to) })}
            onRemove={(index) => patch({ stats: removeAt(stats, index) })}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Value"
                value={stat.value}
                onChange={(e) =>
                  patch({ stats: patchAt(stats, i, { value: e.target.value }) })
                }
                maxChars={rules.stat.value.max}
                error={!!errors[`stats.${i}.value`]}
                hint={errors[`stats.${i}.value`]}
              />
              <InputField
                label="Label"
                value={stat.label}
                onChange={(e) =>
                  patch({ stats: patchAt(stats, i, { label: e.target.value }) })
                }
                maxChars={rules.stat.label.max}
                error={!!errors[`stats.${i}.label`]}
                hint={errors[`stats.${i}.label`]}
              />
            </div>
          </ListRow>
        ))}
      </div>
      {elementToggles(AboutSectionKey.STATS)}
    </SectionCard>
  );
};

export default StatsSection;
