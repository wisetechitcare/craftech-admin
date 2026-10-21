import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Save, ArrowLeft, Loader2, RotateCcw } from "lucide-react";

import FileUpload from "@/components/admin/ui/FileUpload";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { Button } from "@/components/ui/button";

import ProjectCaptionModal from "./ProjectCaptionModal";
import { ProjectDetailsFields } from "./ProjectDetailsFields";

import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_MAX_SIZE_MB,
} from "@/lib/constants/common";
import { DragList } from "@/lib/constants/drag-lists";
import {
  projectImageCaptionMatchesDefault,
  projectImageCaptionPlainLabel,
  resolveProjectImageCaption,
} from "@/lib/constants/projects";
import { projectImageRows } from "@/lib/utils/projects";
import {
  projectsApi,
  appearanceApi,
  portfolioSectionApi,
  uploadApi,
} from "@/services/api";
import { ImageStyleSection, type ImageStyleMap } from "@/types/common";
import {
  ProjectStatus,
  type ProjectFieldDefinition,
  type ProjectFormState,
  type ProjectImageRow,
  type ProjectMedia,
  type ProjectMetadata,
} from "@/types/project";
import { move, toSelectOptions } from "@/utils/utils";

import { ProjectFormImageTile } from "./ProjectFormImageTile";

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState<ProjectFormState>({
    title: "",
    category: "",
    description: "",
    client: "",
    year: new Date().getFullYear(),
    location: "",
    area: "",
    withCollaboration: "",
    status: ProjectStatus.PUBLISHED,
  });
  const [typologies, setTypologies] = useState<string[]>([]);
  const [project, setProject] = useState<ProjectMedia | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadSlot, setImageUploadSlot] = useState(0);
  const [deletingImage, setDeletingImage] = useState<number | null>(null);

  const [savedImageRows, setSavedImageRows] = useState<ProjectImageRow[]>([]);
  const [imageRows, setImageRows] = useState<ProjectImageRow[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [metadata, setMetadata] = useState<ProjectMetadata>({});
  const [imageStyles, setImageStyles] = useState<ImageStyleMap | null>(null);
  const [captionUrl, setCaptionUrl] = useState<string | null>(null);
  const [fieldDefinitions, setFieldDefinitions] = useState<
    ProjectFieldDefinition[]
  >([]);

  const isReordered = useMemo(
    () =>
      imageRows.length !== savedImageRows.length ||
      imageRows.some((row, i) => row.url !== savedImageRows[i]?.url),
    [imageRows, savedImageRows],
  );

  const typologyOptions = useMemo(() => {
    const values = new Set(typologies);
    const current = form.category.trim();
    if (current) values.add(current);
    return toSelectOptions([...values].sort((a, b) => a.localeCompare(b)));
  }, [typologies, form.category]);

  const rememberTypology = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    setTypologies((prev) => {
      if (prev.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return [...prev, trimmed].sort((a, b) => a.localeCompare(b));
    });
  };

  useEffect(() => {
    portfolioSectionApi
      .getSection()
      .then((res) => {
        if (res.data?.success) setFieldDefinitions(res.data.data.fields ?? []);
      })
      .catch(() => toast.error("Failed to load project fields"));
  }, []);

  useEffect(() => {
    appearanceApi
      .get()
      .then((res) => {
        if (res.data?.success) {
          setImageStyles(res.data.data.imageStyles);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    projectsApi
      .getTypologies()
      .then((res) => {
        if (res.data?.success) setTypologies(res.data.data ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      projectsApi
        .getById(id)
        .then((res) => {
          const p = res.data.data as ProjectMedia &
            ProjectFormState & { metadata?: ProjectMetadata };
          setProject(p);
          const rows = projectImageRows(p);
          setSavedImageRows(rows);
          setImageRows(rows);
          setMetadata(p.metadata ?? {});
          setForm({
            title: p.title,
            category: p.category ?? "",
            description: p.description,
            client: p.client ?? "",
            year: p.year ?? "",
            location: p.location ?? "",
            area: p.area ?? "",
            withCollaboration: p.withCollaboration ?? "",
            status: p.status ?? ProjectStatus.PUBLISHED,
          });
        })
        .catch(() => {
          toast.error("Project not found");
          navigate("/admin/projects");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew, navigate]);

  const syncRowsToProject = (rows: ProjectImageRow[]) => {
    setImageRows(rows);
    setSavedImageRows(rows);
    setProject((prev) =>
      prev
        ? {
            ...prev,
            images: rows.map((r) => r.url),
            imagePublicIds: rows.map((r) => r.publicId ?? ""),
            thumbnail: rows[0]?.url ?? prev.thumbnail,
            thumbnailPublicId: rows[0]?.publicId ?? prev.thumbnailPublicId,
          }
        : prev,
    );
  };

  const uploadPendingMedia = async (projectId: string, slug: string) => {
    if (!pendingImages.length) return;

    const fd = new FormData();
    pendingImages.forEach((f) => fd.append("images", f));
    const res = await uploadApi.images(slug, fd);
    const uploaded = res.data.data as { url: string; publicId: string }[];
    await projectsApi.addImages(projectId, {
      urls: uploaded.map((u) => u.url),
      publicIds: uploaded.map((u) => u.publicId),
    });
    const cover = uploaded[0];
    if (cover) {
      await projectsApi.update(projectId, {
        thumbnail: cover.url,
        thumbnailPublicId: cover.publicId,
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let message = "Save failed";
    let isError = true;

    try {
      const payload = {
        ...form,
        year: form.year === "" ? null : Number(form.year),
        category: form.category.trim(),
        client: form.client.trim() || null,
        location: form.location.trim() || null,
        area: form.area.trim() || null,
        withCollaboration: form.withCollaboration.trim() || null,
        thumbnail: "",
        metadata,
      };

      if (isNew) {
        const res = await projectsApi.create(payload);
        message = "Project created";
        if (res.data?.success) {
          isError = false;
          rememberTypology(form.category);
          const created = res.data.data;
          if (pendingImages.length) {
            await uploadPendingMedia(created._id, created.slug);
          }
          toast.success(message);
          navigate(`/admin/projects/${created._id}`);
          return;
        }
      } else {
        const res = await projectsApi.update(id!, payload);
        message = res.data?.message || "Project saved";
        if (res.data?.success) {
          isError = false;
          rememberTypology(form.category);
          setProject((prev) => (prev ? { ...prev, ...form } : prev));
        }
      }
    } catch (err) {
      if (isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
    } finally {
      setSaving(false);
      toast[isError ? "error" : "success"](message);
    }
  };

  const handleImagesUpload = async (files: File[]) => {
    if (!project?.slug || uploadingImages || !files.length || !id) return;
    setUploadingImages(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      const res = await uploadApi.images(project.slug, fd);
      const uploaded = res.data.data as { url: string; publicId: string }[];
      const newRows = uploaded.map((u) => ({
        url: u.url,
        publicId: u.publicId,
      }));
      await projectsApi.addImages(id, {
        urls: newRows.map((r) => r.url),
        publicIds: newRows.map((r) => r.publicId),
      });
      const merged = [...imageRows, ...newRows];
      if (!imageRows.length && merged[0]) {
        await projectsApi.update(id, {
          thumbnail: merged[0].url,
          thumbnailPublicId: merged[0].publicId,
        });
      }
      syncRowsToProject(merged);
      toast.success(`${files.length} image(s) uploaded`);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setImageUploadSlot((s) => s + 1);
      setUploadingImages(false);
    }
  };

  const handleImageDelete = async (index: number) => {
    if (!id || !project) return;
    const row = imageRows[index];
    if (!row) return;
    const serverIndex = project.images.indexOf(row.url);
    if (serverIndex < 0) return;

    setDeletingImage(index);
    try {
      await projectsApi.removeImage(id, serverIndex);
      const updated = await projectsApi.getById(id);
      const p = updated.data.data as ProjectMedia;
      setProject(p);
      const rows = projectImageRows(p);
      syncRowsToProject(rows);
      toast.success("Image removed");
    } catch {
      toast.error("Failed to remove image");
    } finally {
      setDeletingImage(null);
    }
  };

  const saveImageOrder = async () => {
    if (!id || !imageRows.length) return;
    setSavingOrder(true);
    let message = "Failed to save image order";
    let isError = true;
    try {
      const res = await projectsApi.update(id, {
        images: imageRows.map((r) => r.url),
        imagePublicIds: imageRows.map((r) => r.publicId ?? ""),
        thumbnail: imageRows[0].url,
        thumbnailPublicId: imageRows[0].publicId,
      });
      message = res.data?.message || "Order saved";
      if (res.data?.success) {
        isError = false;
        setSavedImageRows(imageRows);
        setProject((prev) =>
          prev
            ? {
                ...prev,
                images: imageRows.map((r) => r.url),
                imagePublicIds: imageRows.map((r) => r.publicId ?? ""),
                thumbnail: imageRows[0].url,
                thumbnailPublicId: imageRows[0].publicId,
              }
            : prev,
        );
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

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-ink-faint" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate(isNew ? "/admin/projects" : `/admin/projects/${id}`)
          }
          aria-label="Back"
          className="rounded-lg bg-raise p-2 transition-colors hover:bg-line"
        >
          <ArrowLeft className="h-5 w-5 text-ink" />
        </button>
        <div>
          {!isNew ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">
              Project
            </p>
          ) : null}
          <h2 className="text-xl font-bold text-ink">
            {isNew ? "New project" : form.title || "Edit project"}
          </h2>
          <p className="text-sm text-ink-mute">
            {isNew
              ? "Save details first; photos upload with the project."
              : "The public URL is generated from the project name."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard
          title="Project details"
          description="Core information shown on the project page. Use the eye on each field to hide it on the public project page."
        >
          <ProjectDetailsFields
            form={form}
            onFormChange={setForm}
            metadata={metadata}
            onMetadataChange={setMetadata}
            typologyOptions={typologyOptions}
            fields={fieldDefinitions}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              size="sm"
              className="text-sm font-bold"
              startIcon={
                saving ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Save className="size-5" />
                )
              }
            >
              {isNew ? "Create project" : "Save changes"}
            </Button>
          </div>
        </SectionCard>
      </form>

      <SectionCard
        title="Images"
        description="Drag by the handle to reorder. The first image is the cover on cards and listings. When hover captions are on, you can edit the cover image caption only."
      >
        <FileUpload
          key={isNew ? "new" : imageUploadSlot}
          acceptTypes={IMAGE_UPLOAD_ACCEPT}
          maxSizeMB={IMAGE_UPLOAD_MAX_SIZE_MB}
          onFilesChange={(files) => {
            if (isNew) {
              setPendingImages((prev) => [...prev, ...files]);
            } else {
              handleImagesUpload(files);
            }
          }}
        />
        {!isNew && uploadingImages ? (
          <p className="text-xs text-ink-mute">Uploading…</p>
        ) : null}

        {!isNew && isReordered ? (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-info/10 px-6 py-3">
            <p className="text-sm font-medium text-ink">
              The order has changed. Save it to update the cover and gallery.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="none"
                size="xs"
                onClick={() => setImageRows(savedImageRows)}
                disabled={savingOrder}
                startIcon={<RotateCcw size={14} />}
                className="gap-1.5 text-sm font-medium text-ink-soft hover:bg-raise"
              >
                Reset
              </Button>
              <Button
                variant="none"
                size="xs"
                onClick={saveImageOrder}
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

        {isNew && pendingImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {pendingImages.map((file, i) => (
              <ProjectFormImageTile
                key={`${file.name}-${file.lastModified}-${i}`}
                src={URL.createObjectURL(file)}
                index={i}
                count={pendingImages.length}
                listId={DragList.PROJECT_IMAGES_PENDING}
                onMove={(from, to) =>
                  setPendingImages((prev) => move(prev, from, to))
                }
                onDelete={() =>
                  setPendingImages((prev) => prev.filter((_, j) => j !== i))
                }
              />
            ))}
          </div>
        ) : null}

        {!isNew && imageRows.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {imageRows.map((row, i) => (
              <ProjectFormImageTile
                key={`${row.url}-${i}`}
                src={row.url}
                index={i}
                count={imageRows.length}
                listId={DragList.PROJECT_IMAGES}
                onMove={(from, to) =>
                  setImageRows((prev) => move(prev, from, to))
                }
                onDelete={() => handleImageDelete(i)}
                deleting={deletingImage === i}
                showCaption={
                  i === 0 &&
                  Boolean(
                    imageStyles?.[ImageStyleSection.PROJECT_DETAIL]
                      .hoverCaption,
                  )
                }
                captionLabel={
                  i === 0
                    ? projectImageCaptionPlainLabel(
                        resolveProjectImageCaption(
                          metadata.imageCaptions?.[row.url],
                          form.title,
                          form.location,
                        ),
                      )
                    : undefined
                }
                onEditCaption={
                  i === 0 ? () => setCaptionUrl(row.url) : undefined
                }
              />
            ))}
          </div>
        ) : null}
      </SectionCard>

      {captionUrl && imageStyles ? (
        <ProjectCaptionModal
          imageUrl={captionUrl}
          position={
            imageRows.findIndex((row) => row.url === captionUrl) + 1 || 1
          }
          count={imageRows.length}
          caption={resolveProjectImageCaption(
            metadata.imageCaptions?.[captionUrl],
            form.title,
            form.location,
          )}
          imageStyles={imageStyles}
          onClose={() => setCaptionUrl(null)}
          onSave={async (caption) => {
            const imageCaptions = { ...metadata.imageCaptions };
            if (
              projectImageCaptionMatchesDefault(
                caption,
                form.title,
                form.location,
              )
            ) {
              delete imageCaptions[captionUrl];
            } else {
              imageCaptions[captionUrl] = caption;
            }
            const nextMetadata: ProjectMetadata = {
              ...metadata,
              imageCaptions:
                Object.keys(imageCaptions).length > 0
                  ? imageCaptions
                  : undefined,
            };
            setMetadata(nextMetadata);
            if (isNew || !id) return;
            const res = await projectsApi.update(id, {
              metadata: { imageCaptions: nextMetadata.imageCaptions },
            });
            if (!res.data?.success) {
              throw new Error(
                res.data?.message || "Failed to save the caption",
              );
            }
            if (res.data.data.metadata) {
              setMetadata(res.data.data.metadata);
            }
          }}
        />
      ) : null}
    </div>
  );
}
