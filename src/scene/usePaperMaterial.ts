import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PAPER_PRESETS } from "../config/paperPresets.config";
import { extractAtlasTile } from "../utils/extractAtlasTile";
import type { PaperPresetId } from "../types/model.types";

export interface PaperControls {
  presetId: PaperPresetId;
  glossOverride: number | null; // 0..1, 0 = glossy, 1 = matte
  tintOverride: string | null;
  structureOverride: number | null; // 0..1 bump intensity
}

function resolveRoughness(controls: PaperControls, presetRoughness: number): number {
  return controls.glossOverride !== null
    ? THREE.MathUtils.lerp(0.15, 0.85, controls.glossOverride)
    : presetRoughness;
}

/**
 * Applies gloss/mat (roughness) and paper structure (normal map, fine-grain
 * repeated) to the COVER material, without touching its baseColorTexture —
 * that stays whatever the user uploaded (see useCoverTexture). Recreates the
 * `glans` / `Structuur` attribute-driven controls from the Blender shader,
 * which do not survive glTF export, using plain PBR channels instead.
 */
export function useCoverFinishMaterial(
  material: THREE.MeshStandardMaterial | undefined,
  paperAtlas: THREE.Texture | undefined,
  controls: PaperControls,
) {
  const currentTileRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    if (!material) return;
    const preset = PAPER_PRESETS[controls.presetId];
    material.roughness = resolveRoughness(controls, preset.roughness);

    if (paperAtlas) {
      const tile = extractAtlasTile(paperAtlas, preset.atlasTileIndex);
      if (tile) {
        tile.wrapS = THREE.RepeatWrapping;
        tile.wrapT = THREE.RepeatWrapping;
        tile.repeat.set(4, 4);
        currentTileRef.current?.dispose();
        currentTileRef.current = tile;
        material.normalMap = tile;
        material.needsUpdate = true;
      }
    }

    const structureIntensity = controls.structureOverride ?? 0.25;
    material.normalScale.set(structureIntensity, structureIntensity);
  }, [material, paperAtlas, controls.presetId, controls.glossOverride, controls.structureOverride]);

  useEffect(() => {
    return () => currentTileRef.current?.dispose();
  }, []);
}

/**
 * Applies the paper-type preset (atlas tile + tint + roughness) to the
 * procedural page-edge material — this represents the visible page-stack
 * paper stock, separate from the printed cover.
 */
export function usePageEdgeMaterial(
  material: THREE.MeshStandardMaterial | undefined,
  paperAtlas: THREE.Texture | undefined,
  controls: PaperControls,
) {
  const currentTileRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    if (!material) return;
    const preset = PAPER_PRESETS[controls.presetId];

    material.roughness = resolveRoughness(controls, preset.roughness);
    material.color = new THREE.Color(controls.tintOverride ?? preset.tintColor);

    if (paperAtlas) {
      const tile = extractAtlasTile(paperAtlas, preset.atlasTileIndex);
      if (tile) {
        currentTileRef.current?.dispose();
        currentTileRef.current = tile;
        material.map = tile;
        material.needsUpdate = true;
      }
    }
  }, [material, paperAtlas, controls.presetId, controls.tintOverride]);

  useEffect(() => {
    return () => currentTileRef.current?.dispose();
  }, []);
}
