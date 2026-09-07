import { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, AlertTriangle, Loader2 } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function SampleUploader({ onUpload, uploading, sampleCount, maxSamples = 10 }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState("");

  function validateFile(file) {
    setValidationError("");

    if (!file) return false;

    // Check file format
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setValidationError("Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP.");
      return false;
    }

    // Check size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError("File size exceeds 5MB limit. Please upload a smaller image.");
      return false;
    }

    // Check empty file
    if (file.size < 2048) {
      setValidationError("File appears to be empty or corrupted.");
      return false;
    }

    return true;
  }

  function handleFileSelect(file) {
    if (sampleCount >= maxSamples) {
      setValidationError(`Maximum limit of ${maxSamples} samples reached. Please delete an existing sample.`);
      return;
    }

    if (!validateFile(file)) return;

    // Quality check via Image object
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width < 300 || img.height < 200) {
        setValidationError("Image resolution is too low. Please upload a clearer handwriting sample.");
        return;
      }
      onUpload(file);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setValidationError("Corrupted image file. Please upload a valid image.");
    };
    img.src = objectUrl;
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  const isLimitReached = sampleCount >= maxSamples;

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (!isLimitReached && !uploading && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isLimitReached
            ? "border-paper-200 bg-paper-100/50 cursor-not-allowed"
            : dragActive
            ? "border-terracotta-600 bg-terracotta-50/40 cursor-pointer"
            : "border-ink-100 bg-white hover:border-terracotta-500/60 hover:bg-paper-50/50 cursor-pointer"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
              e.target.value = "";
            }
          }}
          disabled={uploading || isLimitReached}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-100 text-terracotta-600 group-hover:scale-110 transition-transform">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>

        <h4 className="mt-3 text-sm font-semibold text-ink-900">
          {uploading
            ? "Uploading handwriting sample..."
            : isLimitReached
            ? "Sample Limit Reached"
            : "Drag & drop your handwriting sheet or browse"}
        </h4>

        <p className="mt-1 text-xs text-ink-700">
          {isLimitReached
            ? `You have uploaded the maximum ${maxSamples} samples allowed.`
            : "Supports JPG, JPEG, PNG, WEBP (Max 5MB each)."}
        </p>

        {!isLimitReached && !uploading ? (
          <div className="mt-4">
            <Button size="sm" variant="secondary" type="button">
              <ImageIcon className="mr-1.5 h-3.5 w-3.5 inline" />
              Choose File
            </Button>
          </div>
        ) : null}
      </div>

      {validationError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      ) : null}
    </div>
  );
}
