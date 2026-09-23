import React, { useEffect, useState, type ReactNode } from "react";
import { Accept, FileRejection, useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

import { cn } from "../../../utils/utils";

interface FileUploadProps {
  acceptTypes: Accept;
  maxFiles?: number;
  maxSizeMB?: number;
  hint?: ReactNode;
  onFilesChange?: (files: File[]) => void;
  existingImages?: string[];
  onExistingImagesChange?: (images: string[]) => void;
  error?: string;
  deletedImages?: string[];
  onDeletedImagesChange?: (images: string[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  acceptTypes,
  maxFiles = 10,
  maxSizeMB = 5,
  hint,
  onFilesChange,
  existingImages = [],
  onExistingImagesChange,
  error = "",
  deletedImages,
  onDeletedImagesChange,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] =
    useState<string[]>(existingImages);
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const firstKey = Object.keys(acceptTypes)[0];
  const maxBytes = maxSizeMB * 1024 * 1024;

  useEffect(() => {
    if (existingImages) {
      setExistingImageUrls(existingImages);
    }
  }, [existingImages]);

  useEffect(() => {
    if (deletedImages) {
      setDeletedImageUrls(deletedImages);
    }
  }, [deletedImages]);

  const onDrop = (acceptedFiles: File[]) => {
    const totalFiles = files.length + existingImageUrls.length;
    if (acceptedFiles.length + totalFiles > maxFiles) {
      setMessage(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    const tooLarge = acceptedFiles.find((file) => file.size > maxBytes);
    if (tooLarge) {
      setMessage(
        `"${tooLarge.name}" is too large. Max allowed size: ${maxSizeMB} MB.`,
      );
      return;
    }

    const updatedFiles = [...files, ...acceptedFiles];
    setFiles(updatedFiles);
    setMessage("");
    onFilesChange?.(updatedFiles);
  };

  const onDropRejected = (fileRejections: FileRejection[]) => {
    if (fileRejections.length === 0) return;

    const firstRejection = fileRejections[0];
    const { errors } = firstRejection;

    for (const dropError of errors) {
      if (dropError.code === "file-too-large") {
        setMessage(`File too large. Max allowed size: ${maxSizeMB} MB.`);
        return;
      }
      if (dropError.code === "file-invalid-type") {
        setMessage(`Invalid file type. Please upload ${firstKey} only .`);
        return;
      }
      if (dropError.code === "too-many-files") {
        setMessage(`You can only upload maximum ${maxFiles} files.`);
        return;
      }
    }
  };

  const handleRemove = (index: number) => {
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
    multiple: true,
    maxFiles,
    maxSize: maxBytes,
  });

  const defaultHint = `Supports continuous high-res JPEG, PNG, or WebP formats up to ${maxSizeMB}MB`;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-3xl py-10 px-6 text-center cursor-pointer transition-all duration-200 border-2 border-dashed",
          isDragActive
            ? "bg-brand-25 border-brand-500"
            : "bg-gray-50 border-gray-300 hover:bg-brand-25 hover:border-brand-500",
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-6 h-6 text-gray-900" />
        <p className="mt-3 text-base font-medium text-gray-900">
          Drag and drop images, or{" "}
          <span className="underline">browse files</span>
        </p>
        {hint ?? <p className="mt-2 text-sm text-gray-500">{defaultHint}</p>}
      </div>

      {(message || error) && (
        <p className="text-red-600 text-sm">{message || error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        {existingImageUrls.map((url, index) => (
          <div key={`existing-${index}`} className="relative">
            <button
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600 z-10"
            >
              ×
            </button>
            <img
              src={url}
              alt={`Existing ${index + 1}`}
              className="w-24 h-24 object-cover rounded-md border"
            />
            <p className="text-xs mt-1 truncate w-24">Image {index + 1}</p>
          </div>
        ))}
        {files.map((file, index) => {
          const displayIndex = existingImageUrls.length + index;
          return (
            <div key={`file-${index}`} className="relative">
              <button
                onClick={() => handleRemove(displayIndex)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600 z-10"
              >
                ×
              </button>
              {file.type.startsWith("image") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-24 h-24 object-cover rounded-md border"
                />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center border rounded-md bg-red-50 text-red-600 font-bold">
                  {file.name.split(".").pop()?.toUpperCase()}
                </div>
              )}
              <p className="text-xs mt-1 truncate w-24">{file.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileUpload;
