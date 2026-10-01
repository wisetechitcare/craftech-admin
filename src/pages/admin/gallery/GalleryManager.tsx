import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save, Trash2 } from "lucide-react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/common";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import FileUpload from "@/components/admin/ui/FileUpload";
import ImageStyleCard from "@/components/admin/ui/ImageStyleCard";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import SectionContentCard from "@/components/admin/ui/SectionContentCard";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { PreviewSection } from "@/components/admin/ui/SitePreview";
import {
  SectionVisibilitySwitch,
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";
import { Button } from "@/components/ui/button";
import GalleryCaptionModal from "./GalleryCaptionModal";
import GalleryTile from "./GalleryTile";

import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_MAX_SIZE_MB,
} from "@/lib/constants/common";
import {
  GALLERY_SECTION_FIELDS,
  GALLERY_UPLOAD_FOLDER,
  GALLERY_VISIBILITY_KEY,
} from "@/lib/constants/gallery";
import { appearanceApi, galleryApi, uploadApi } from "@/services/api";
import { ImageStyleSection, type ImageStyleMap } from "@/types/common";
import type {
  GalleryImage,
  GalleryImageUpdatePayload,
  GallerySectionContent,
} from "@/types/gallery";
import { move } from "@/utils/utils";

const ids = (images: GalleryImage[]) => images.map((image) => image._id);

const GalleryManager = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  // The order as the server last confirmed it. Dragging only moves `images`;
  // this is what "Save order" sends against and what "Reset" restores.
  const [saved, setSaved] = useState<GalleryImage[]>([]);
  // Lifted out of the section card so the preview draws the unsaved copy.
  const [section, setSection] = useState<GallerySectionContent>({
    eyebrow: "",
    title: "",
    description: "",
  });
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  // Null until Appearance answers: the server owns the defaults.
  const [imageStyles, setImageStyles] = useState<ImageStyleMap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  // Bumped after every upload so FileUpload remounts empty, as in SlideMedia.
  const [uploadSlot, setUploadSlot] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // The ids the open confirm dialog will delete: one tile, the selection, or all.
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  // The image whose caption dialog is open.
  const [captionId, setCaptionId] = useState<string | null>(null);

  const sectionVisible = isVisible(visibility, GALLERY_VISIBILITY_KEY);
  const isReordered = ids(images).join() !== ids(saved).join();
  const allSelected = images.length > 0 && selectedIds.length === images.length;

  const selectImage = (id: string, selected: boolean) =>
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((selectedId) => selectedId !== id),
    );

  // Loads toast only on failure: a success toast on every page visit is noise.
  const fetchImages = async () => {
    let message = "Failed to load the gallery";
    let isError = true;

    try {
      const response = await galleryApi.list();

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setImages(response.data.data);
        setSaved(response.data.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
      }

      setLoading(false);
    }
  };

  const fetchAppearance = async () => {
    let message = "Failed to load section visibility and image style";
    let isError = true;

    try {
      const response = await appearanceApi.get();

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setVisibility(response.data.data.visibility ?? {});
        setImageStyles(response.data.data.imageStyles);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
      }
    }
  };

  const fetchSection = async () => {
    let message = "Failed to load the Gallery section content";
    let isError = true;

    try {
      const response = await galleryApi.getSection();

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setSection(response.data.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
      }
    }
  };

  useEffect(() => {
    fetchImages();
    fetchSection();
    fetchAppearance();
  }, []);

  // One file at a time, so a failure names the file it stopped at and the
  // ones before it are already in the gallery.
  const handleUpload = async (files: File[]) => {
    if (uploading || !files.length) return;

    let message = "Failed to upload the images";
    let isError = true;

    setUploading(true);

    try {
      for (const file of files) {
        message = `Failed to upload ${file.name}`;
        const form = new FormData();
        form.append("file", file);
        const { data: upload } = await uploadApi.cmsMedia(
          GALLERY_UPLOAD_FOLDER,
          form,
        );

        const response = await galleryApi.create({
          name: file.name.slice(0, 200),
          url: upload.data.url,
          publicId: upload.data.publicId,
        });

        message = response.data?.message || message;
        if (!response.data?.success) return;
      }

      isError = false;
      message =
        files.length > 1
          ? `${files.length} images added to the gallery`
          : message;
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
      } else {
        toast.success(message);
      }

      // An unsaved drag is dropped with the list it was made on.
      await fetchImages();
      setUploadSlot((slot) => slot + 1);
      setUploading(false);
    }
  };

  const handleDelete = async (idsToDelete: string[]) => {
    let message = "Failed to delete the images";
    let isError = true;

    setDeleting(true);

    try {
      const response = await galleryApi.removeMany(idsToDelete);

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setDeleteIds(null);
        setSelectedIds((prev) =>
          prev.filter((id) => !idsToDelete.includes(id)),
        );
        await fetchImages();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
      } else {
        toast.success(message);
      }

      setDeleting(false);
    }
  };

  const saveOrder = async () => {
    let message = "Failed to save the new gallery order";
    let isError = true;

    setSaving(true);

    try {
      const response = await galleryApi.reorder(ids(images));

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setSaved(images);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
        fetchImages();
      } else {
        toast.success(message);
      }

      setSaving(false);
    }
  };

  const moveImage = (from: number, to: number) =>
    setImages((prev) => move(prev, from, to));

  // Both lists, so a saved caption survives "Reset" of an unsaved drag.
  const applyCaption = (id: string, caption: GalleryImageUpdatePayload) => {
    const withCaption = (list: GalleryImage[]) =>
      list.map((image) =>
        image._id === id ? { ...image, ...caption } : image,
      );
    setImages(withCaption);
    setSaved(withCaption);
  };

  const captionIndex = images.findIndex((image) => image._id === captionId);
  // Captions are edited only while the site would show them.
  const captionsOn = Boolean(
    imageStyles?.[ImageStyleSection.GALLERY].hoverCaption,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        count={images.length}
        description="Manage the gallery copy, images and their order. The switch hides the homepage section; nothing is deleted."
        action={
          <SectionVisibilitySwitch
            visible={sectionVisible}
            onChange={(visible) =>
              setVisibility((prev) => ({
                ...prev,
                [GALLERY_VISIBILITY_KEY]: visible,
              }))
            }
          />
        }
      />

      <PreviewPanel
        section={PreviewSection.GALLERY}
        placement="above"
        draft={{
          galleryContent: { images, section },
          appearance: { visibility, ...(imageStyles && { imageStyles }) },
        }}
        caption="The live homepage Gallery section, rendered by the website itself. Unsaved copy, order and visibility show here before you save them."
        sectionHidden={!sectionVisible}
        onShowSection={() =>
          setVisibility((prev) => ({ ...prev, [GALLERY_VISIBILITY_KEY]: true }))
        }
      >
        <SectionContentCard
          name="Gallery"
          description="Shown above the images on the homepage and the Gallery page. Leave a field empty to keep the text shown as its placeholder."
          fields={GALLERY_SECTION_FIELDS}
          content={section}
          onChange={setSection}
          onSave={galleryApi.updateSection}
          visibilityKey={GALLERY_VISIBILITY_KEY}
          visibility={visibility}
          onVisibilityChange={setVisibility}
        />

        {imageStyles && (
          <ImageStyleCard
            section={ImageStyleSection.GALLERY}
            description="How every Gallery layout draws its images, on the homepage and the Gallery page. The preview shows a change before you save it."
            styles={imageStyles}
            onChange={setImageStyles}
          />
        )}

        <SectionCard
          title="Images"
          description="Drag an image by its handle to reorder. The homepage shows the first few; the Gallery page shows them all. With Caption on hover switched on, the button under each image edits its caption."
          controls={
            images.length ? (
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) =>
                      setSelectedIds(e.target.checked ? ids(images) : [])
                    }
                    className="size-4 rounded border-line"
                  />
                  Select all
                </label>
                {selectedIds.length > 0 && (
                  <Button
                    variant="none"
                    size="sm"
                    onClick={() => setDeleteIds(selectedIds)}
                    startIcon={<Trash2 size={16} />}
                    className="rounded-lg bg-danger text-sm font-bold text-white"
                  >
                    {allSelected
                      ? "Delete all"
                      : `Delete selected (${selectedIds.length})`}
                  </Button>
                )}
              </div>
            ) : null
          }
        >
          <FileUpload
            key={uploadSlot}
            acceptTypes={IMAGE_UPLOAD_ACCEPT}
            maxSizeMB={IMAGE_UPLOAD_MAX_SIZE_MB}
            onFilesChange={handleUpload}
          />
          {uploading && <p className="text-xs text-ink-mute">Uploading…</p>}

          {isReordered && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-info/10 px-6 py-3">
              <p className="text-sm font-medium text-ink">
                The order has changed. Save it to publish the new arrangement.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="none"
                  size="xs"
                  onClick={() => setImages(saved)}
                  disabled={saving}
                  startIcon={<RotateCcw size={14} />}
                  className="gap-1.5 text-sm font-medium text-ink-soft hover:bg-raise"
                >
                  Reset
                </Button>
                <Button
                  variant="none"
                  size="xs"
                  onClick={saveOrder}
                  disabled={saving}
                  startIcon={
                    saving ? (
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
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
            </div>
          ) : images.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {images.map((image, index) => (
                <GalleryTile
                  key={image._id}
                  image={image}
                  index={index}
                  count={images.length}
                  onMove={moveImage}
                  onDelete={(id) => setDeleteIds([id])}
                  selected={selectedIds.includes(image._id)}
                  onSelect={selectImage}
                  showCaption={captionsOn}
                  onEditCaption={setCaptionId}
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-ink-mute">
              No images yet. Upload your first one above.
            </p>
          )}
        </SectionCard>
      </PreviewPanel>

      {imageStyles && captionsOn && captionIndex >= 0 && (
        <GalleryCaptionModal
          key={images[captionIndex]._id}
          image={images[captionIndex]}
          position={captionIndex + 1}
          count={images.length}
          imageStyles={imageStyles}
          onClose={() => setCaptionId(null)}
          onSaved={applyCaption}
        />
      )}

      <ConfirmModal
        open={deleteIds !== null}
        title={
          deleteIds?.length === 1
            ? "Delete image?"
            : `Delete ${deleteIds?.length} images?`
        }
        message="They are removed from the gallery and the media library. This action cannot be undone."
        loading={deleting}
        onConfirm={() => deleteIds && handleDelete(deleteIds)}
        onCancel={() => setDeleteIds(null)}
      />
    </div>
  );
};

export default GalleryManager;
