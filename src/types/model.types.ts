export type ModelKey = "krant" | "magazine";

export type VariantKey =
  | "krant-plat"
  | "krant-rechtopstaand"
  | "krant-spread"
  | "magazine-gebonden"
  | "magazine-geniet"
  | "magazine-spread";

export type CoverSlots = "single" | "spread";

export type ThicknessMode = "krant-binary" | "magazine-continuous" | "none";

export type SpineAxis = "x" | "z";

export interface CoverCropRegion {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

export interface VariantConfig {
  key: VariantKey;
  modelKey: ModelKey;
  label: string;
  /** Node name in the glb whose mesh carries the swappable cover material. */
  coverNodeName: string;
  /** Material name on that node holding the baseColorTexture to replace. */
  coverMaterialName: string;
  coverSlots: CoverSlots;
  /** Rotate the (flat, lying) source mesh upright in our own scene. */
  standing: boolean;
  thicknessMode: ThicknessMode;
  spineAxis: SpineAxis;
  /** Target width/height aspect ratio the uploaded cover should fill. */
  targetCoverAspect: number;
  coverCropRegion?: CoverCropRegion;
  /** Node name for the ground plane that receives shadows. */
  shadowCatcherNodeName: string;
  /** Node name for the infinity-cove backdrop. */
  backdropNodeName: string;
}

export interface ModelSource {
  key: ModelKey;
  label: string;
  url: string;
}

export type PaperPresetId = "krantenpapier" | "glans" | "mat" | "recycled";

export interface PaperPreset {
  id: PaperPresetId;
  label: string;
  roughness: number;
  tintColor: string;
  atlasTileIndex: number;
}

export interface CameraPreset {
  id: string;
  label: string;
  /** Rotation around the vertical axis in degrees, 0 = looking from +Z (front). */
  azimuthDeg: number;
  /** Angle from the top (Y axis) in degrees; 90 = eye-level, <90 = looking down. */
  polarDeg: number;
  /** Camera distance as a multiple of the model's bounding-sphere radius. */
  distanceMultiplier: number;
}
