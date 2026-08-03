import * as THREE from "three";
import type { VariantConfig } from "../types/model.types";
import { findMeshByName, findObjectByName } from "./glbIntrospection";

export interface AssetValidationResult {
  variantKey: string;
  ok: boolean;
  missing: string[];
}

/**
 * Dev-time sanity check: confirms every node the manifest references for a
 * variant actually exists (with real geometry) in the loaded glb scene.
 * Missing nodes are logged clearly instead of silently rendering nothing —
 * this is exactly what catches the known Krant-Spread / Magazine-Gebonden /
 * Magazine-Geniet asset gaps.
 */
export function validateVariantAssets(scene: THREE.Object3D, variant: VariantConfig): AssetValidationResult {
  const missing: string[] = [];

  const coverMesh = findMeshByName(scene, variant.coverNodeName);
  if (!coverMesh) {
    missing.push(`cover mesh node "${variant.coverNodeName}"`);
  }

  const backdrop = findObjectByName(scene, variant.backdropNodeName);
  if (!backdrop) missing.push(`backdrop node "${variant.backdropNodeName}"`);

  const shadowCatcher = findObjectByName(scene, variant.shadowCatcherNodeName);
  if (!shadowCatcher) missing.push(`shadow catcher node "${variant.shadowCatcherNodeName}"`);

  const result: AssetValidationResult = { variantKey: variant.key, ok: missing.length === 0, missing };

  if (!result.ok && import.meta.env.DEV) {
    console.warn(
      `[assetValidation] Variant "${variant.key}" is missing assets in the source .glb: ${missing.join(", ")}. ` +
        "This variant will be unavailable in the UI until the asset is exported and added.",
    );
  }

  return result;
}
