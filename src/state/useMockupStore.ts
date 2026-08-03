import { create } from "zustand";
import type { ModelKey, PaperPresetId, VariantKey } from "../types/model.types";
import { DEFAULT_CAMERA_PRESET_ID } from "../config/cameraPresets.config";
import { MAGAZINE_THICKNESS_RANGE } from "../config/models.config";

export interface CoverImageData {
  file: File;
  objectUrl: string;
  naturalWidth: number;
  naturalHeight: number;
}

export type CoverSlotKey = "single" | "left" | "right";

export type SizeMode = "pixels" | "physical";
export type PhysicalUnit = "cm" | "mm" | "inch";

export interface ExportSettings {
  sizeMode: SizeMode;
  widthPx: number;
  heightPx: number;
  physicalWidth: number;
  physicalHeight: number;
  physicalUnit: PhysicalUnit;
  dpi: number;
}

interface MockupState {
  modelType: ModelKey;
  variant: VariantKey;
  coverImages: Partial<Record<CoverSlotKey, CoverImageData>>;

  krantThicknessState: "normaal" | "weekend";
  magazineThicknessMm: number;

  paperPresetId: PaperPresetId;
  paperGlossOverride: number | null;
  paperTintOverride: string | null;
  paperStructureOverride: number | null;

  shadowEnabled: boolean;
  shadowOpacity: number;

  activeCameraPresetId: string;

  exportSettings: ExportSettings;
  exportRequestId: number;
  isExporting: boolean;
  lastExportError: string | null;

  setModelType: (m: ModelKey) => void;
  setVariant: (v: VariantKey) => void;
  setCoverImage: (slot: CoverSlotKey, data: CoverImageData | null) => void;

  setKrantThicknessState: (s: "normaal" | "weekend") => void;
  setMagazineThicknessMm: (mm: number) => void;

  setPaperPresetId: (id: PaperPresetId) => void;
  setPaperGlossOverride: (v: number | null) => void;
  setPaperTintOverride: (v: string | null) => void;
  setPaperStructureOverride: (v: number | null) => void;

  setShadowEnabled: (v: boolean) => void;
  setShadowOpacity: (v: number) => void;

  setActiveCameraPresetId: (id: string) => void;

  setExportSettings: (s: Partial<ExportSettings>) => void;
  requestExport: () => void;
  setIsExporting: (v: boolean) => void;
  setLastExportError: (e: string | null) => void;
}

export const useMockupStore = create<MockupState>((set) => ({
  modelType: "krant",
  variant: "krant-rechtopstaand",
  coverImages: {},

  krantThicknessState: "normaal",
  magazineThicknessMm: MAGAZINE_THICKNESS_RANGE.default,

  paperPresetId: "mat",
  paperGlossOverride: null,
  paperTintOverride: null,
  paperStructureOverride: null,

  shadowEnabled: true,
  shadowOpacity: 0.55,

  activeCameraPresetId: DEFAULT_CAMERA_PRESET_ID,

  exportSettings: {
    sizeMode: "pixels",
    widthPx: 2000,
    heightPx: 2000,
    physicalWidth: 10,
    physicalHeight: 10,
    physicalUnit: "cm",
    dpi: 300,
  },
  exportRequestId: 0,
  isExporting: false,
  lastExportError: null,

  setModelType: (m) => set({ modelType: m }),
  setVariant: (v) => set({ variant: v }),
  setCoverImage: (slot, data) =>
    set((state) => {
      const next = { ...state.coverImages };
      const prev = next[slot];
      if (prev) URL.revokeObjectURL(prev.objectUrl);
      if (data) next[slot] = data;
      else delete next[slot];
      return { coverImages: next };
    }),

  setKrantThicknessState: (s) => set({ krantThicknessState: s }),
  setMagazineThicknessMm: (mm) => set({ magazineThicknessMm: mm }),

  setPaperPresetId: (id) => set({ paperPresetId: id }),
  setPaperGlossOverride: (v) => set({ paperGlossOverride: v }),
  setPaperTintOverride: (v) => set({ paperTintOverride: v }),
  setPaperStructureOverride: (v) => set({ paperStructureOverride: v }),

  setShadowEnabled: (v) => set({ shadowEnabled: v }),
  setShadowOpacity: (v) => set({ shadowOpacity: v }),

  setActiveCameraPresetId: (id) => set({ activeCameraPresetId: id }),

  setExportSettings: (s) =>
    set((state) => ({ exportSettings: { ...state.exportSettings, ...s } })),
  requestExport: () => set((state) => ({ exportRequestId: state.exportRequestId + 1, lastExportError: null })),
  setIsExporting: (v) => set({ isExporting: v }),
  setLastExportError: (e) => set({ lastExportError: e }),
}));
