import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import {
  Plus,
  Loader2,
  Search,
  FolderOpen,
  SlidersHorizontal,
  RotateCcw,
  Save,
} from "lucide-react";

import { PageHeader } from "@/components/common";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { Button } from "@/components/ui/button";
import SelectField from "@/components/admin/ui/SelectField";
import { projectsApi } from "@/services/api";
import { move, toSelectOptions } from "@/utils/utils";

import ProjectAdminCard, { type AdminProjectRow } from "./ProjectAdminCard";
import ProjectsSectionPanel from "./ProjectsSectionPanel";

const projectIds = (rows: AdminProjectRow[]) => rows.map((p) => p._id);

export default function ProjectsList() {
  const navigate = useNavigate();
  const [savedProjects, setSavedProjects] = useState<AdminProjectRow[]>([]);
  const [projects, setProjects] = useState<AdminProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProjectRow | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const canReorder = !search.trim() && categoryFilter === "All";
  const isReordered =
    canReorder &&
    (projects.length !== savedProjects.length ||
      projects.some((p, i) => p._id !== savedProjects[i]?._id));

  const fetchProjects = () => {
    setLoading(true);
    projectsApi
      .getAll({ sort: "order", limit: 50 })
      .then((res: { data: { data: AdminProjectRow[] } }) => {
        setProjects(res.data.data);
        setSavedProjects(res.data.data);
      })
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectsApi.delete(deleteTarget._id);
      toast.success("Project and all media deleted");
      setDeleteTarget(null);
      fetchProjects();
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    let message = "Failed to save project order";
    let isError = true;
    try {
      const res = await projectsApi.reorder(projectIds(projects));
      message = res.data?.message || "Order saved";
      if (res.data?.success) {
        isError = false;
        const rows = res.data.data as AdminProjectRow[];
        setProjects(rows);
        setSavedProjects(rows);
      }
    } catch (err) {
      if (isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
    } finally {
      setSavingOrder(false);
      toast[isError ? "error" : "success"](message);
    }
  };

  const typologyOptions = useMemo(() => {
    const fromProjects = projects.map((p) => p.category).filter(Boolean);
    return ["All", ...new Set(fromProjects)];
  }, [projects]);

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const displayList = canReorder ? projects : filtered;

  return (
    <div className="space-y-6">
      <ProjectsSectionPanel />

      <PageHeader
        title="Projects"
        count={projects.length}
        description="Manage portfolio entries and their media."
      />

      <SectionCard
        title="All projects"
        description={
          canReorder
            ? "Drag a card by its handle to reorder. This order is used on the homepage and /projects."
            : "Clear search and typology filters to reorder projects."
        }
        controls={
          <Button
            variant="primary"
            size="sm"
            startIcon={<Plus size={20} />}
            onClick={() => navigate("/admin/projects/new")}
            className="text-sm font-bold"
          >
            New project
          </Button>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-raise px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-ink-mute" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or client..."
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/30"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-line bg-raise px-3 py-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-ink-mute" />
            <SelectField
              className="min-w-0 flex-1"
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              options={toSelectOptions(typologyOptions)}
              triggerClassName="h-auto border-0 bg-transparent px-0 py-0 text-ink shadow-none focus:ring-0"
            />
          </div>
        </div>

        {isReordered ? (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-info/10 px-6 py-3">
            <p className="text-sm font-medium text-ink">
              The order has changed. Save it to publish the new arrangement.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="none"
                size="xs"
                onClick={() => setProjects(savedProjects)}
                disabled={savingOrder}
                startIcon={<RotateCcw size={14} />}
                className="gap-1.5 text-sm font-medium text-ink-soft hover:bg-raise"
              >
                Reset
              </Button>
              <Button
                variant="none"
                size="xs"
                onClick={saveOrder}
                disabled={savingOrder}
                startIcon={
                  savingOrder ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )
                }
                className="gap-1.5 bg-info px-4 py-2 text-sm font-medium text-white"
              >
                Save order
              </Button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="space-y-3 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-ink-faint" />
              <p className="text-sm text-ink-mute">Loading projects...</p>
            </div>
          </div>
        ) : displayList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper py-20 text-center">
            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-ink-faint" />
            <p className="mb-1 font-semibold text-ink">
              {projects.length === 0
                ? "No projects yet"
                : "No projects match your filters"}
            </p>
            <p className="mb-5 text-sm text-ink-mute">
              {projects.length === 0
                ? "Add your first construction project."
                : "Try adjusting search or category."}
            </p>
            {projects.length === 0 && (
              <Button
                variant="primary"
                size="sm"
                startIcon={<Plus size={20} />}
                onClick={() => navigate("/admin/projects/new")}
                className="text-sm font-bold"
              >
                Create first project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {displayList.map((p, i) => (
              <ProjectAdminCard
                key={p._id}
                project={p}
                index={i}
                count={displayList.length}
                reorderEnabled={canReorder}
                onMove={(from, to) =>
                  setProjects((prev) => move(prev, from, to))
                }
                onDelete={() => setDeleteTarget(p)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Project"
        message={`This will permanently delete "${deleteTarget?.title}" and ALL associated images and videos from Cloudinary. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
