"use client";

import { useState } from "react";
import { saveBrandLogo, type LogoPosition } from "@/lib/actions/brand-logo";

interface MediaItem {
  id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  signedUrl?: string;
}

interface BrandLogoPickerProps {
  workspaceId: string;
  mediaItems: MediaItem[];
  currentLogoId: string | null;
  currentPosition: LogoPosition;
}

const POSITIONS: { value: LogoPosition; label: string }[] = [
  { value: "top-left",     label: "↖ Top Left"     },
  { value: "top-right",    label: "↗ Top Right"    },
  { value: "bottom-left",  label: "↙ Bottom Left"  },
  { value: "bottom-right", label: "↘ Bottom Right" },
  { value: "center",       label: "⊕ Center"       },
];

export function BrandLogoPicker({
  workspaceId,
  mediaItems,
  currentLogoId,
  currentPosition,
}: BrandLogoPickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(currentLogoId);
  const [position, setPosition]     = useState<LogoPosition>(currentPosition);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const result = await saveBrandLogo(workspaceId, selectedId, position);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleRemove = async () => {
    setSelectedId(null);
    await saveBrandLogo(workspaceId, null, position);
  };

  const logoImages = mediaItems.filter((m) =>
    ["image/png", "image/svg+xml", "image/webp", "image/jpeg"].includes(m.mime_type)
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white">Brand Logo</h3>
        <p className="text-xs text-gray-400 mt-1">
          Your logo will be automatically added to every generated image.
          Upload your logo in the Media Library first, then select it here.
        </p>
      </div>

      {logoImages.length === 0 ? (
        <p className="text-xs text-gray-500 italic">
          No images in your Media Library yet. Upload your logo there first.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {logoImages.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelectedId(img.id === selectedId ? null : img.id)}
              className={`
                relative rounded-lg border-2 overflow-hidden aspect-square
                transition-all duration-150
                ${img.id === selectedId
                  ? "border-purple-500 ring-2 ring-purple-500/40"
                  : "border-gray-700 hover:border-gray-500"}
              `}
            >
              {img.signedUrl ? (
                <img
                  src={img.signedUrl}
                  alt={img.file_name}
                  className="object-contain w-full h-full p-2"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500 text-xs p-2 text-center">
                  {img.file_name}
                </div>
              )}
              {img.id === selectedId && (
                <div className="absolute top-1 right-1 bg-purple-500 rounded-full w-4 h-4 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <div>
        <label className="text-xs text-gray-400 mb-2 block">Logo Position</label>
        <div className="grid grid-cols-2 gap-2">
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPosition(p.value)}
              className={`
                text-xs py-2 px-3 rounded-md border transition-all
                ${position === p.value
                  ? "border-purple-500 bg-purple-500/20 text-purple-300"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"}
              `}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {selectedId && (
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 rounded-md px-3 py-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Logo selected — will appear on all generated images in the {position} corner.
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save Brand Logo"}
        </button>

        {selectedId && (
          <button
            onClick={handleRemove}
            className="py-2 px-4 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-400/50 text-sm rounded-lg transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
