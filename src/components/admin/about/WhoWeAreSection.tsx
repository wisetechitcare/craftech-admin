import InputField from "@/components/admin/ui/InputField";
import ListRow from "@/components/admin/ui/ListRow";
import TextArea from "@/components/admin/ui/TextArea";

import {
  AddButton,
  HeadFields,
  IconItemRows,
  ListHeader,
  SectionCard,
  type AboutSectionProps,
} from "./shared";

import { AboutSectionKey } from "@/lib/constants/about";
import { DragList } from "@/lib/constants/drag-lists";
import { EMPTY_DETAIL, EMPTY_ITEM } from "@/types/about";
import { move, patchAt, removeAt } from "@/utils/utils";

/** Who We Are — the statement, the company details listed with it, and the
 *  values grid. Values is its own key in the document but is edited here,
 *  because that is where every layout but Floating draws it. */
const WhoWeAreSection = ({
  content,
  rules,
  errors,
  patchSection,
  toggle,
  elementToggles,
}: AboutSectionProps) => {
  const { whoWeAre, values } = content;

  return (
    <SectionCard
      title="Who We Are"
      description="The statement beside the story image, the facts listed with it, and the values grid."
      controls={toggle(AboutSectionKey.WHO_WE_ARE)}
    >
      <HeadFields
        section={whoWeAre}
        rules={rules}
        errors={errors}
        path="whoWeAre"
        onChange={(changes) => patchSection("whoWeAre", changes)}
      />
      <TextArea
        label="Description"
        value={whoWeAre.description}
        onChange={(e) =>
          patchSection("whoWeAre", { description: e.target.value })
        }
        maxChars={rules.quote.max}
        error={!!errors["whoWeAre.description"]}
        rows={3}
        hint={errors["whoWeAre.description"]}
        tooltip="Set as a pull quote in every layout."
      />
      <InputField
        label="Attribution"
        value={whoWeAre.attribution}
        onChange={(e) =>
          patchSection("whoWeAre", { attribution: e.target.value })
        }
        maxChars={rules.attribution.max}
        error={!!errors["whoWeAre.attribution"]}
        hint={errors["whoWeAre.attribution"]}
        tooltip="Who the statement is from. Leave empty to hide the line."
      />

      <div className="pt-1 space-y-4">
        <ListHeader
          nested
          title="Company details"
          description="Listed in order. The first is also the badge on the story image; Floating shows the second as its accent figure."
          count={whoWeAre.details.length}
          max={rules.lists.details.max}
          controls={
            <AddButton
              label="Add Detail"
              disabled={whoWeAre.details.length >= rules.lists.details.max}
              onClick={() =>
                patchSection("whoWeAre", {
                  details: [...whoWeAre.details, { ...EMPTY_DETAIL }],
                })
              }
            />
          }
        />
        {whoWeAre.details.map((detail, i) => (
          <ListRow
            key={i}
            title="Detail"
            index={i}
            count={whoWeAre.details.length}
            listId={DragList.ABOUT_DETAILS}
            onMove={(from, to) =>
              patchSection("whoWeAre", {
                details: move(whoWeAre.details, from, to),
              })
            }
            onRemove={(index) =>
              patchSection("whoWeAre", {
                details: removeAt(whoWeAre.details, index),
              })
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Label"
                value={detail.label}
                onChange={(e) =>
                  patchSection("whoWeAre", {
                    details: patchAt(whoWeAre.details, i, {
                      label: e.target.value,
                    }),
                  })
                }
                maxChars={rules.detail.label.max}
                error={!!errors[`whoWeAre.details.${i}.label`]}
                hint={errors[`whoWeAre.details.${i}.label`]}
              />
              <InputField
                label="Value"
                value={detail.value}
                onChange={(e) =>
                  patchSection("whoWeAre", {
                    details: patchAt(whoWeAre.details, i, {
                      value: e.target.value,
                    }),
                  })
                }
                maxChars={rules.detail.value.max}
                error={!!errors[`whoWeAre.details.${i}.value`]}
                hint={errors[`whoWeAre.details.${i}.value`]}
              />
            </div>
          </ListRow>
        ))}
      </div>

      <div className="pt-1 space-y-4">
        <ListHeader
          nested
          title="Values"
          description="Shown beside the statement, or as their own band in Floating."
          count={values.items.length}
          max={rules.lists.values.max}
          controls={
            <AddButton
              label="Add Value"
              disabled={values.items.length >= rules.lists.values.max}
              onClick={() =>
                patchSection("values", {
                  items: [...values.items, { ...EMPTY_ITEM }],
                })
              }
            />
          }
        />
        <HeadFields
          section={values}
          rules={rules}
          errors={errors}
          path="values"
          onChange={(changes) => patchSection("values", changes)}
        />
        <IconItemRows
          items={values.items}
          rules={rules}
          errors={errors}
          path="values.items"
          listId={DragList.ABOUT_VALUES}
          title="Value"
          iconTooltip="Font Awesome name, e.g. shield-halved. Leave empty for the default."
          onChange={(items) => patchSection("values", { items })}
        />
      </div>
      {elementToggles(AboutSectionKey.WHO_WE_ARE)}
    </SectionCard>
  );
};

export default WhoWeAreSection;
