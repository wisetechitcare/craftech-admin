import type { ProjectImageRow, ProjectMedia } from "@/types/project";

export const projectImageRows = (project: ProjectMedia): ProjectImageRow[] => {
  const rows = project.images.map((url, index) => ({
    url,
    publicId: project.imagePublicIds?.[index],
  }));
  if (!rows.length || !project.thumbnail) return rows;
  const coverAt = rows.findIndex((row) => row.url === project.thumbnail);
  if (coverAt <= 0) return rows;
  const next = [...rows];
  const [cover] = next.splice(coverAt, 1);
  next.unshift(cover);
  return next;
};
