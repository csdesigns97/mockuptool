import { useRef } from "react";
import { useMockupStore, type CoverSlotKey } from "../../state/useMockupStore";
import { VARIANTS } from "../../config/models.config";

function readImageFile(file: File): Promise<{ objectUrl: string; naturalWidth: number; naturalHeight: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ objectUrl, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Kon afbeelding niet laden"));
    };
    img.src = objectUrl;
  });
}

function UploadSlot({ slot, label }: { slot: CoverSlotKey; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cover = useMockupStore((s) => s.coverImages[slot]);
  const setCoverImage = useMockupStore((s) => s.setCoverImage);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const { objectUrl, naturalWidth, naturalHeight } = await readImageFile(file);
    setCoverImage(slot, { file, objectUrl, naturalWidth, naturalHeight });
  };

  return (
    <div
      className="upload-slot"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void handleFile(e.dataTransfer.files[0] ?? null);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />
      {cover ? (
        <img src={cover.objectUrl} alt={label} className="upload-thumb" />
      ) : (
        <span className="upload-placeholder">{label}
          <br />
          Klik of sleep een afbeelding
        </span>
      )}
      {cover && (
        <button
          type="button"
          className="upload-clear"
          onClick={(e) => {
            e.stopPropagation();
            setCoverImage(slot, null);
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function CoverUploader() {
  const variant = useMockupStore((s) => VARIANTS[s.variant]);

  return (
    <div className="panel-section">
      <h3>Cover</h3>
      {variant.coverSlots === "single" ? (
        <UploadSlot slot="single" label="Cover" />
      ) : (
        <div className="upload-row">
          <UploadSlot slot="left" label="Linkerpagina" />
          <UploadSlot slot="right" label="Rechterpagina" />
        </div>
      )}
    </div>
  );
}
