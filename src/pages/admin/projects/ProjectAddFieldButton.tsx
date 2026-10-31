import { useState } from "react";

import Modal from "@/components/admin/ui/Modal";
import { AddButton } from "@/components/admin/ui/SectionCard";
import ProjectFieldsManager from "./ProjectFieldsManager";

import { PROJECT_FIELD_LIMIT } from "@/lib/constants/projects";
import type { ProjectFieldDefinition } from "@/types/project";

interface ProjectAddFieldButtonProps {
  fieldCount: number;
  onFieldsSaved: (fields: ProjectFieldDefinition[]) => void;
}

/** Projects › Fields in a dialog, opened on a blank field, so a missing field
 *  is added without leaving — or losing — the project being edited. */
const ProjectAddFieldButton = ({
  fieldCount,
  onFieldsSaved,
}: ProjectAddFieldButtonProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <AddButton
        label="Add Field"
        disabled={fieldCount >= PROJECT_FIELD_LIMIT}
        onClick={() => setOpen(true)}
      />

      <Modal
        open={open}
        title="Add a project field"
        description="Fields are shared by all projects — the same as Projects › Fields."
        onClose={() => setOpen(false)}
        className="max-w-4xl"
      >
        <ProjectFieldsManager
          startWithNewField
          onSaved={(fields) => {
            onFieldsSaved(fields);
            setOpen(false);
          }}
        />
      </Modal>
    </>
  );
};

export default ProjectAddFieldButton;
