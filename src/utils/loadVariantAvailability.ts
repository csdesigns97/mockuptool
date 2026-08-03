import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Group } from "three";
import { MODEL_SOURCES, VARIANTS } from "../config/models.config";
import { validateVariantAssets } from "./assetValidation";
import type { ModelKey, VariantKey } from "../types/model.types";

/**
 * Loads both source .glb files once (independent of the R3F canvas) purely
 * to check which variants have real geometry, so the sidebar can disable
 * variants that are still asset gaps (e.g. Krant-Spread, Magazine-Gebonden,
 * Magazine-Geniet) instead of letting the user pick something that renders
 * empty.
 */
export async function loadVariantAvailability(): Promise<Record<VariantKey, boolean>> {
  const loader = new GLTFLoader();
  const entries = await Promise.all(
    (Object.keys(MODEL_SOURCES) as ModelKey[]).map(async (key) => {
      const gltf = await loader.loadAsync(MODEL_SOURCES[key].url);
      return [key, gltf.scene] as const;
    }),
  );
  const sceneByModel = Object.fromEntries(entries) as Record<ModelKey, Group>;

  const result = {} as Record<VariantKey, boolean>;
  for (const variant of Object.values(VARIANTS)) {
    const scene = sceneByModel[variant.modelKey];
    result[variant.key] = validateVariantAssets(scene, variant).ok;
  }
  return result;
}
