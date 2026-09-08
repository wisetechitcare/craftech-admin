import React, { useCallback, useEffect, useState } from "react";
import { Accept, FileRejection, useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

import { cn } from "../../../utils/utils";
import { isHeroVideo } from "../../../types/hero";

interface FileUploadProps {
  acceptTypes: Accept;
  maxFiles?: number;
  maxSizeMB?: number;
  onFilesChange?: (files: File[]) => void;
  /** URLs of assets already stored for this field. */
  existingImages?: string[];
  onExistingImagesChange?: (images: string[]) => void;
  error?: string;
  deletedImages?: string[];
  onDeletedImagesChange?: (images: string[]) => void;
  /** Overrides the supported-formats line under the prompt. */
  hint?: string;
  /** Overrides the prompt itself. */
  label?: React.ReactNode;
  /** Shown in place of the prompt while the parent is uploading. */
  busy?: boolean;
}

const isVideoFile = (file: File) => file.type.startsWith("video");

const FileUpload: React.FC<FileUploadProps> = ({
  acceptTypes,
  maxFiles = 10,
  maxSizeMB = 5,
  onFilesChange,
  existingImages = [],
  onExistingImagesChange,
  error = "",
  deletedImages,
  onDeletedImagesChange,
  hint,
  label,
  busy = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] =
    useState<string[]>(existingImages);
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const firstKey = Object.keys(acceptTypes)[0];

  // Update existing images when prop changes
  useEffect(() => {
    if (existingImages) {
      setExistingImageUrls(existingImages);
    }
  }, [existingImages]);

  // Update deleted images when prop changes
  useEffect(() => {
    if (deletedImages) {
      setDeletedImageUrls(deletedImages);
    }
  }, [deletedImages]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const totalFiles = files.length + existingImageUrls.length;
      if (acceptedFiles.length + totalFiles > maxFiles) {
        setMessage(
          maxFiles === 1
            ? "Remove the current file first, then add the new one."
            : `You can only upload up to ${maxFiles} files.`,
        );
        return;
      }
      const updatedFiles = [...files, ...acceptedFiles];
      setFiles(updatedFiles);
      setMessage("");
      onFilesChange?.(updatedFiles);
    },
    [files, existingImageUrls.length, maxFiles, onFilesChange],
  );

  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      if (fileRejections.length === 0) return;

      const { errors } = fileRejections[0];

      for (const err of errors) {
        if (err.code === "file-too-large") {
          setMessage(`File too large. Max allowed size: ${maxSizeMB}MB.`);
          return;
        }
        if (err.code === "file-invalid-type") {
          setMessage(`Invalid file type. Please upload ${firstKey} only.`);
          return;
        }
        if (err.code === "too-many-files") {
          setMessage(`You can only upload maximum ${maxFiles} files.`);
          return;
        }
      }
    },
    [maxFiles, maxSizeMB, firstKey],
  );

  const handleRemove = (index: number) => {
    // If removing an existing asset (URL)
    if (index < existingImageUrls.length) {
      const updated = existingImageUrls.filter((_, i) => i !== index);
      setExistingImageUrls(updated);
      onExistingImagesChange?.(updated);

      const updatedDeletedImages = [
        ...deletedImageUrls,
        existingImageUrls[index],
      ];
      setDeletedImageUrls(updatedDeletedImages);
      onDeletedImagesChange?.(updatedDeletedImages);
    } else {
      // If removing a newly staged file
      const fileIndex = index - existingImageUrls.length;
      const updated = files.filter((_, i) => i !== fileIndex);
      setFiles(updated);
      onFilesChange?.(updated);
      if (updated.length <= maxFiles) {
        setMessage("");
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: acceptTypes,
    multiple: maxFiles > 1,
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl py-8 px-6 text-center cursor-pointer transition-all duration-200 border-2 border-dashed",
          isDragActive
            ? "bg-info/5 border-info"
            : "bg-raise border-line hover:bg-info/5 hover:border-info",
        )}
      >
        <input {...getInputProps()} />
        <Upload
          className={cn(
            "w-6 h-6",
            busy ? "text-ink-faint animate-pulse" : "text-ink",
          )}
        />
        <p className="mt-3 text-sm font-medium text-ink">
          {busy
            ? "Uploading…"
            : (label ?? (
                <>
                  Drag and drop files, or{" "}
                  <span className="underline">browse files</span>
                </>
              ))}
        </p>
        <p className="mt-2 text-xs text-ink-mute">
          {hint ?? `Supports JPEG, PNG or WebP up to ${maxSizeMB}MB`}
        </p>
      </div>

      {(message || error) && (
        <p className="text-danger text-xs">{message || error}</p>
      )}

      {/* Preview: stored assets first, then staged files. */}
      <div className="flex flex-wrap gap-3">
        {existingImageUrls.map((url, index) => (
          <div key={`existing-${index}`} className="relative">
            <button
              type="button"
              onClick={() => handleRemove(index)}
              aria-label={`Remove file ${index + 1}`}
              className="absolute -top-2 -right-2 bg-danger text-white rounded-full w-5 h-5 text-xs leading-none hover:opacity-90 z-10"
            >
              ×
            </button>
            {isHeroVideo(url) ? (
              <video
                src={url}
                muted
                loop
                playsInline
                className="w-24 h-24 object-cover rounded-md border border-line bg-raise"
              />
            ) : (
              <img
                src={url}
                alt={`Stored ${index + 1}`}
                className="w-24 h-24 object-cover rounded-md border border-line bg-raise"
              />
            )}
            <p className="text-[11px] mt-1 truncate w-24 text-ink-mute">
              {isHeroVideo(url) ? "Video" : "Image"} {index + 1}
            </p>
          </div>
        ))}

        {files.map((file, index) => {
          const displayIndex = existingImageUrls.length + index;
          return (
            <div key={`file-${index}`} className="relative">
              <button
                type="button"
                onClick={() => handleRemove(displayIndex)}
                aria-label={`Remove ${file.name}`}
                className="absolute -top-2 -right-2 bg-danger text-white rounded-full w-5 h-5 text-xs leading-none hover:opacity-90 z-10"
              >
                ×
              </button>
              {file.type.startsWith("image") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-24 h-24 object-cover rounded-md border border-line"
                />
              ) : isVideoFile(file) ? (
                <video
                  src={URL.createObjectURL(file)}
                  muted
                  loop
                  playsInline
                  className="w-24 h-24 object-cover rounded-md border border-line bg-raise"
                />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center border border-line rounded-md bg-raise text-ink-mute text-xs font-bold">
                  {file.name.split(".").pop()?.toUpperCase()}
                </div>
              )}
              <p className="text-[11px] mt-1 truncate w-24 text-ink-mute">
                {file.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileUpload;
