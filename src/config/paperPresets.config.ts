import type { PaperPreset, PaperPresetId } from "../types/model.types";

// Tile layout of the embedded `paper-types-atlas` texture (2x2 grid, confirmed
// by inspecting the source image): top-left=glans, top-right=recycled,
// bottom-left=mat, bottom-right=krantenpapier.
export const PAPER_ATLAS_GRID = { cols: 2, rows: 2 };

export const PAPER_PRESETS: Record<PaperPresetId, PaperPreset> = {
  glans: { id: "glans", label: "Glans", roughness: 0.18, tintColor: "#f5f4f0", atlasTileIndex: 0 },
  recycled: { id: "recycled", label: "Recycled", roughness: 0.65, tintColor: "#cabb9d", atlasTileIndex: 1 },
  mat: { id: "mat", label: "Mat", roughness: 0.45, tintColor: "#f0efe9", atlasTileIndex: 2 },
  krantenpapier: { id: "krantenpapier", label: "Krantenpapier", roughness: 0.8, tintColor: "#e8e4d8", atlasTileIndex: 3 },
};

export function atlasTileOffset(tileIndex: number): { offsetX: number; offsetY: number } {
  const { cols, rows } = PAPER_ATLAS_GRID;
  const col = tileIndex % cols;
  const rowFromTop = Math.floor(tileIndex / cols);
  const row = rows - 1 - rowFromTop; // UV origin is bottom-left, image rows are top-down
  return { offsetX: col / cols, offsetY: row / rows };
}
