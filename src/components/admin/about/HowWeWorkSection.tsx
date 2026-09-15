import InputField from "@/components/admin/ui/InputField";
import ListRow from "@/components/admin/ui/ListRow";
import TextArea from "@/components/admin/ui/TextArea";

import {
  AddButton,
  HeadFields,
  SectionCard,
  type AboutSectionProps,
} from "./shared";

import { AboutSectionKey } from "@/lib/constants/about";
import { DragList } from "@/lib/constants/drag-lists";
import { EMPTY_STEP } from "@/types/about";
import { move, patchAt, removeAt } from "@/utils/utils";

/** How We Work — the process steps, in the order they are performed. */
const HowWeWorkSection = ({
  content,
  rules,
  errors,
  patchSection,
  toggle,
  elementToggles,
}: AboutSectionProps) => {
  const { howWeWork } = content;

  return (
    <SectionCard
      title="How We Work"
      description="The process steps, in the order they are performed."
      count={howWeWork.steps.length}
      max={rules.lists.howWeWork.max}
      controls={
        <div className="flex items-center gap-3">
          {toggle(AboutSectionKey.HOW_WE_WORK)}
          <AddButton
            label="Add Step"
            disabled={howWeWork.steps.length >= rules.lists.howWeWork.max}
            onClick={() =>
              patchSection("howWeWork", {
                steps: [...howWeWork.steps, { ...EMPTY_STEP }],
              })
            }
          />
        </div>
      }
    >
      <HeadFields
        section={howWeWork}
        rules={rules}
        errors={errors}
        path="howWeWork"
        onChange={(changes) => patchSection("howWeWork", changes)}
      />
      <div className="space-y-4">
        {howWeWork.steps.map((step, i) => (
          <ListRow
            key={i}
            title="Step"
            index={i}
            count={howWeWork.steps.length}
            listId={DragList.ABOUT_HOW_WE_WORK}
            onMove={(from, to) =>
              patchSection("howWeWork", {
                steps: move(howWeWork.steps, from, to),
              })
            }
            onRemove={(index) =>
              patchSection("howWeWork", {
                steps: removeAt(howWeWork.steps, index),
              })
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Number"
                value={step.number}
                onChange={(e) =>
                  patchSection("howWeWork", {
                    steps: patchAt(howWeWork.steps, i, {
                      number: e.target.value,
                    }),
                  })
                }
                maxChars={rules.step.number.max}
                error={!!errors[`howWeWork.steps.${i}.number`]}
                hint={errors[`howWeWork.steps.${i}.number`]}
                tooltip={'Printed as written — "01" reads better than "1".'}
              />
              <div className="md:col-span-2">
                <InputField
                  label="Title"
                  value={step.title}
                  onChange={(e) =>
                    patchSection("howWeWork", {
                      steps: patchAt(howWeWork.steps, i, {
                        title: e.target.value,
                      }),
                    })
                  }
                  maxChars={rules.step.title.max}
                  error={!!errors[`howWeWork.steps.${i}.title`]}
                  hint={errors[`howWeWork.steps.${i}.title`]}
                />
              </div>
            </div>
            <TextArea
              label="Description"
              value={step.description}
              onChange={(e) =>
                patchSection("howWeWork", {
                  steps: patchAt(howWeWork.steps, i, {
                    description: e.target.value,
                  }),
                })
              }
              maxChars={rules.step.description.max}
              error={!!errors[`howWeWork.steps.${i}.description`]}
              hint={errors[`howWeWork.steps.${i}.description`]}
            />
          </ListRow>
        ))}
      </div>
      {elementToggles(AboutSectionKey.HOW_WE_WORK)}
    </SectionCard>
  );
};

export default HowWeWorkSection;
