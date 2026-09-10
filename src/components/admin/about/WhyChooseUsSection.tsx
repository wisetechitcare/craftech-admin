import {
  AddButton,
  HeadFields,
  IconItemRows,
  SectionCard,
  type AboutSectionProps,
} from "./shared";

import { AboutSectionKey } from "@/lib/constants/about";
import { DragList } from "@/lib/constants/drag-lists";
import { EMPTY_ITEM } from "@/types/about";

/** Why Choose Us — the reasons list, shown in the order below. */
const WhyChooseUsSection = ({
  content,
  rules,
  errors,
  patchSection,
  toggle,
  elementToggles,
}: AboutSectionProps) => {
  const { whyChooseUs } = content;

  return (
    <SectionCard
      title="Why Choose Us"
      description="The reasons list. Shown in the order below."
      count={whyChooseUs.items.length}
      max={rules.lists.whyChooseUs.max}
      controls={
        <div className="flex items-center gap-3">
          {toggle(AboutSectionKey.WHY_CHOOSE_US)}
          <AddButton
            label="Add Reason"
            disabled={whyChooseUs.items.length >= rules.lists.whyChooseUs.max}
            onClick={() =>
              patchSection("whyChooseUs", {
                items: [...whyChooseUs.items, { ...EMPTY_ITEM }],
              })
            }
          />
        </div>
      }
    >
      <HeadFields
        section={whyChooseUs}
        rules={rules}
        errors={errors}
        path="whyChooseUs"
        onChange={(changes) => patchSection("whyChooseUs", changes)}
      />
      <div className="space-y-4">
        <IconItemRows
          items={whyChooseUs.items}
          rules={rules}
          errors={errors}
          path="whyChooseUs.items"
          listId={DragList.ABOUT_WHY_CHOOSE_US}
          title="Reason"
          iconTooltip="Font Awesome name, e.g. circle-check."
          onChange={(items) => patchSection("whyChooseUs", { items })}
        />
      </div>
      {elementToggles(AboutSectionKey.WHY_CHOOSE_US)}
    </SectionCard>
  );
};

export default WhyChooseUsSection;
