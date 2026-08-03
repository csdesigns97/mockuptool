import type { CameraPreset } from "../types/model.types";

// Positions are relative to the model's runtime bounding-sphere center/radius
// (see CameraRig.tsx), so the same presets work for flat-lying and standing
// variants across both the krant and magazine models.
export const CAMERA_PRESETS: CameraPreset[] = [
  { id: "front", label: "Front", azimuthDeg: 0, polarDeg: 80, distanceMultiplier: 2.6 },
  { id: "three-quarter-left", label: "3/4 links", azimuthDeg: -35, polarDeg: 75, distanceMultiplier: 2.6 },
  { id: "three-quarter-right", label: "3/4 rechts", azimuthDeg: 35, polarDeg: 75, distanceMultiplier: 2.6 },
  { id: "top", label: "Bovenaanzicht", azimuthDeg: 0, polarDeg: 25, distanceMultiplier: 3.2 },
  { id: "side", label: "Zijaanzicht", azimuthDeg: 90, polarDeg: 80, distanceMultiplier: 2.6 },
];

export const DEFAULT_CAMERA_PRESET_ID = "three-quarter-left";
