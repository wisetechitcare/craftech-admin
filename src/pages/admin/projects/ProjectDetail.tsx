import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";

import { HeroCarousel } from "@/components/common/Carousel";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import { Button } from "@/components/ui/button";

import { usePreviewSiteUrl } from "@/hooks/use-preview-site-url";
import { projectsApi } from "@/services/api";

import {
  projectCarouselImages,
  type AdminProjectRow,
} from "./ProjectAdminCard";

const EMPTY = "—";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const siteUrl = usePreviewSiteUrl();
  const [project, setProject] = useState<AdminProjectRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    projectsApi
      .getById(id)
      .then((res: { data: { data: AdminProjectRow } }) =>
        setProject(res.data.data),
      )
      .catch(() => {
        toast.error("Project not found");
        navigate("/admin/projects");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const images = useMemo(
    () => (project ? projectCarouselImages(project) : []),
    [project],
  );

  const publicHref =
    project?.slug && siteUrl ? `${siteUrl}/projects/${project.slug}` : null;

  const siteLabel = useMemo(() => {
    if (!siteUrl) return null;
    try {
      return new URL(siteUrl).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  }, [siteUrl]);

  const handleDelete = async () => {
    if (!project) return;
    setDeleting(true);
    try {
      await projectsApi.delete(project._id);
      toast.success("Project deleted");
      navigate("/admin/projects");
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-ink-faint" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/projects")}
          aria-label="Back to projects"
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink shadow-theme-xs hover:bg-raise"
        >
          <ArrowLeft className="size-4" /> Projects
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/admin/projects/${project._id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink hover:bg-raise"
          >
            <Pencil className="size-4" /> Edit
          </Link>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete project"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <article className="rounded-2xl border border-line bg-paper p-5 shadow-sm sm:p-6">
        <div className="relative">
          <HeroCarousel images={images} className="h-56 rounded-xl sm:h-100" />
        </div>

        <div className="mt-6 space-y-0">
          <h1 className="text-xl font-bold text-ink sm:text-2xl">
            {project.title}
          </h1>

          <div className="mt-8 space-y-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
              <div className="flex-1">
                <p className="text-sm text-grey-muted-foreground">
                  Client Name
                </p>
                <p className="mt-1 text-base font-medium text-ink">
                  {project.client}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-grey-muted-foreground">Location</p>
                <p className="mt-1 text-base font-medium text-ink">
                  {project.location}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
              <div className="flex-1">
                <p className="text-sm text-grey-muted-foreground">
                  Year of Completion
                </p>
                <p className="mt-1 text-base font-medium text-ink">
                  {project.year}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-grey-muted-foreground">Typology</p>
                <p className="mt-1 text-base font-medium text-ink">
                  {project.category}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
              <div className="flex-1">
                <p className="text-sm text-ink-mute">Area</p>
                <p className="mt-1 text-base font-bold text-ink">
                  {project.area || EMPTY}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-ink-mute">With Collaboration</p>
                <p className="mt-1 text-base font-bold text-ink">
                  {project.withCollaboration || EMPTY}
                </p>
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-base font-bold text-ink">About the Project</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">
              {project.description || "No description available"}
            </p>
          </section>
        </div>
      </article>

      <ConfirmModal
        open={deleteOpen}
        title="Delete Project"
        message={`Permanently delete "${project.title}" and all media?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </div>
  );
}
