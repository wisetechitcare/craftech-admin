import InputField from "@/components/admin/ui/InputField";
import ListRow from "@/components/admin/ui/ListRow";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import SelectField from "@/components/admin/ui/SelectField";
import TextArea from "@/components/admin/ui/TextArea";
import {
  VisibilityToggle,
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";

import { DragList } from "@/lib/constants/drag-lists";
import {
  CONTACT_FIELD_DEFAULTS,
  CONTACT_FIELD_LABELS,
  CONTACT_FORM_FIELD_KEYS,
  CONTACT_SECTION_DEFAULTS,
  CONTACT_SUBMIT_LABEL_DEFAULTS,
  CONTACT_VISIBILITY_KEY,
} from "@/lib/constants/contact";
import { move } from "@/utils/utils";
import type {
  ContactFormFieldKey,
  ContactSectionContent,
  ContactSubmissionMode,
} from "@/types/contact";

interface ContactSectionContentCardProps {
  content: ContactSectionContent;
  onChange: (content: ContactSectionContent) => void;
  visibility: VisibilityMap;
  onVisibilityChange: (visibility: VisibilityMap) => void;
}

const SUBMISSION_OPTIONS = [
  { value: "mail", label: "Email (lead capture)" },
  { value: "whatsapp", label: "WhatsApp" },
];

const ContactSectionContentCard = ({
  content,
  onChange,
  visibility,
  onVisibilityChange,
}: ContactSectionContentCardProps) => {
  const patch = (changes: Partial<ContactSectionContent>) =>
    onChange({ ...content, ...changes });

  const patchVisibility = (key: string, visible: boolean) =>
    onVisibilityChange({ ...visibility, [key]: visible });

  const sectionVisible = isVisible(visibility, CONTACT_VISIBILITY_KEY);
  const fieldToggle = (part: string) => {
    const key = `${CONTACT_VISIBILITY_KEY}.${part}`;
    return (
      <VisibilityToggle
        visible={sectionVisible && isVisible(visibility, key)}
        disabled={!sectionVisible}
        onChange={(visible) => patchVisibility(key, visible)}
      />
    );
  };

  const patchField = (
    key: ContactFormFieldKey,
    changes: Partial<ContactSectionContent["fields"][ContactFormFieldKey]>,
  ) =>
    patch({
      fields: {
        ...content.fields,
        [key]: { ...content.fields[key], ...changes },
      },
    });

  const submitPlaceholder =
    CONTACT_SUBMIT_LABEL_DEFAULTS[content.submissionMode];

  // A save made before a field key existed leaves it out of the stored order.
  const fieldOrder = [
    ...new Set([...(content.fieldOrder ?? []), ...CONTACT_FORM_FIELD_KEYS]),
  ];

  return (
    <>
      <SectionCard
        title="Contact Us"
        description="Heading and supporting text."
      >
        <InputField
          label="Title"
          value={content.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder={CONTACT_SECTION_DEFAULTS.title}
          labelAction={fieldToggle("title")}
        />
        <TextArea
          label="Supporting text"
          value={content.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder={CONTACT_SECTION_DEFAULTS.description}
          labelAction={fieldToggle("description")}
        />
      </SectionCard>

      <SectionCard
        title="Form fields"
        description="Labels and placeholders for each input. Required fields must be filled before submit. Drag to change the order they appear in on the website."
      >
        {/* The grip badge sits on each card's top edge, so the rows need room
            above them for it to land in rather than over the row before. */}
        <div className="space-y-6 pt-2">
          {fieldOrder.map((key, index) => {
            const field = content.fields[key];
            const defaults = CONTACT_FIELD_DEFAULTS[key];
            return (
              <ListRow
                key={key}
                title={CONTACT_FIELD_LABELS[key]}
                index={index}
                count={fieldOrder.length}
                listId={DragList.CONTACT_FORM_FIELDS}
                chrome="grip"
                showRemove={false}
                onMove={(from, to) =>
                  patch({ fieldOrder: move(fieldOrder, from, to) })
                }
                onRemove={() => undefined}
              >
                <p className="mb-4 text-sm font-bold text-ink">
                  {CONTACT_FIELD_LABELS[key]}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Label"
                    value={field.label}
                    onChange={(e) => patchField(key, { label: e.target.value })}
                    placeholder={defaults.label}
                  />
                  <InputField
                    label="Placeholder"
                    value={field.placeholder}
                    onChange={(e) =>
                      patchField(key, { placeholder: e.target.value })
                    }
                    placeholder={defaults.placeholder}
                  />
                  <label className="flex items-center gap-2 text-sm font-medium text-ink md:col-span-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        patchField(key, { required: e.target.checked })
                      }
                      className="size-4 rounded border-line"
                    />
                    Required field
                  </label>
                </div>
              </ListRow>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Form submission"
        description="WhatsApp opens a chat with the WhatsApp number under Contact information. Email keeps the existing lead flow."
      >
        <SelectField
          label="Submission type"
          value={content.submissionMode}
          onValueChange={(value) =>
            patch({ submissionMode: value as ContactSubmissionMode })
          }
          options={SUBMISSION_OPTIONS}
        />
        <InputField
          label="Submit button label"
          value={content.submitLabel}
          onChange={(e) => patch({ submitLabel: e.target.value })}
          placeholder={submitPlaceholder}
        />
      </SectionCard>
    </>
  );
};

export default ContactSectionContentCard;
