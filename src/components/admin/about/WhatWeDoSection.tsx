import InputField from "@/components/admin/ui/InputField";

import {
  AddButton,
  HeadFields,
  IconItemRows,
  SectionCard,
  type AboutSectionProps,
} from "./shared";

import { AboutSectionKey } from "@/lib/constants/about";
import { DragList } from "@/lib/constants/drag-lists";
import { EMPTY_CAPABILITY } from "@/types/about";
import { patchAt } from "@/utils/utils";

/** What We Do — the services list, shown in the order below. The only list
 *  whose rows carry tags as well as the shared icon/title/description. */
const WhatWeDoSection = ({
  content,
  rules,
  errors,
  patchSection,
  toggle,
  elementToggles,
}: AboutSectionProps) => {
  const { whatWeDo } = content;

  return (
    <SectionCard
      title="What We Do"
      description="The services list. Shown in the order below."
      count={whatWeDo.items.length}
      max={rules.lists.whatWeDo.max}
      controls={
        <div className="flex items-center gap-3">
          {toggle(AboutSectionKey.WHAT_WE_DO)}
          <AddButton
            label="Add Service"
            disabled={whatWeDo.items.length >= rules.lists.whatWeDo.max}
            onClick={() =>
              patchSection("whatWeDo", {
                items: [...whatWeDo.items, { ...EMPTY_CAPABILITY }],
              })
            }
          />
        </div>
      }
    >
      <HeadFields
        section={whatWeDo}
        rules={rules}
        errors={errors}
        path="whatWeDo"
        onChange={(changes) => patchSection("whatWeDo", changes)}
      />
      <div className="space-y-4">
        <IconItemRows
          items={whatWeDo.items}
          rules={rules}
          errors={errors}
          path="whatWeDo.items"
          listId={DragList.ABOUT_WHAT_WE_DO}
          title="Service"
          iconTooltip="Font Awesome name, e.g. layer-group."
          onChange={(items) => patchSection("whatWeDo", { items })}
          extra={(item, i) => (
            <InputField
              label="Tags"
              value={item.tags.join(", ")}
              onChange={(e) =>
                patchSection("whatWeDo", {
                  items: patchAt(whatWeDo.items, i, {
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .slice(0, rules.lists.tags.max),
                  }),
                })
              }
              error={
                !!(
                  errors[`whatWeDo.items.${i}.tags`] ||
                  errors[`whatWeDo.items.${i}.tags.0`]
                )
              }
              hint={
                errors[`whatWeDo.items.${i}.tags`] ||
                errors[`whatWeDo.items.${i}.tags.0`]
              }
              tooltip={`Comma-separated, up to ${rules.lists.tags.max}. Clean Modern shows the first two.`}
            />
          )}
        />
      </div>
      {elementToggles(AboutSectionKey.WHAT_WE_DO)}
    </SectionCard>
  );
};

export default WhatWeDoSection;
