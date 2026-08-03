import { useEffect, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMockupStore } from "../state/useMockupStore";
import { KRANT_THICKNESS, MODEL_SOURCES, VARIANTS } from "../config/models.config";
import { asStandardMaterial, findMeshByName, findObjectByName } from "../utils/glbIntrospection";
import { validateVariantAssets } from "../utils/assetValidation";
import { useCoverTexture } from "./useCoverTexture";
import { useSpreadCoverTexture } from "./useSpreadCoverTexture";
import { useCoverFinishMaterial, type PaperControls } from "./usePaperMaterial";
import { PageEdge } from "./PageEdge";

// Real paper-type texture atlas extracted from the source .glb materials
// (Blender wired it as a normal/bump input; we reuse it both as the cover's
// structure normal map and as the page-edge's paper-type color atlas).
const PAPER_ATLAS_URL = "/textures/paper-types-atlas.jpg";

function useOptionalTexture(url: string): THREE.Texture | undefined {
  const [texture, setTexture] = useState<THREE.Texture | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    let loaded: THREE.Texture | undefined;
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        loaded = tex;
        setTexture(tex);
      },
      undefined,
      () => setTexture(undefined),
    );
    return () => {
      cancelled = true;
      loaded?.dispose();
    };
  }, [url]);

  return texture;
}

interface ModelProps {
  onBoundsChange: (center: THREE.Vector3, radius: number) => void;
}

export function Model({ onBoundsChange }: ModelProps) {
  const variantKey = useMockupStore((s) => s.variant);
  const variant = VARIANTS[variantKey];
  const modelSource = MODEL_SOURCES[variant.modelKey];
  const { scene } = useGLTF(modelSource.url);

  const coverImages = useMockupStore((s) => s.coverImages);
  const krantThicknessState = useMockupStore((s) => s.krantThicknessState);
  const magazineThicknessMm = useMockupStore((s) => s.magazineThicknessMm);
  const paperPresetId = useMockupStore((s) => s.paperPresetId);
  const paperGlossOverride = useMockupStore((s) => s.paperGlossOverride);
  const paperTintOverride = useMockupStore((s) => s.paperTintOverride);
  const paperStructureOverride = useMockupStore((s) => s.paperStructureOverride);

  useEffect(() => {
    validateVariantAssets(scene, variant);
  }, [scene, variant]);

  // useGLTF caches and shares the parsed scene graph across renders/instances.
  // <primitive> reparents whatever object it's given, which would otherwise
  // destructively remove these nodes from that shared cache on every render.
  // Cloning keeps the cached scene intact so repeated lookups stay correct.
  const coverMesh = useMemo(() => {
    const mesh = findMeshByName(scene, variant.coverNodeName);
    return mesh ? (mesh.clone() as THREE.Mesh) : undefined;
  }, [scene, variant.coverNodeName]);
  const backdrop = useMemo(() => {
    const obj = findObjectByName(scene, variant.backdropNodeName);
    return obj?.clone();
  }, [scene, variant.backdropNodeName]);
  const coverMaterial = coverMesh ? asStandardMaterial(coverMesh.material) : undefined;

  const geometrySize = useMemo(() => {
    if (!coverMesh) return { width: 2, depth: 2 };
    const geom = coverMesh.geometry;
    if (!geom.boundingBox) geom.computeBoundingBox();
    const box = geom.boundingBox ?? new THREE.Box3(new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 0, 1));
    const size = box.getSize(new THREE.Vector3());
    return { width: size.x || 2, depth: size.z || 2 };
  }, [coverMesh]);

  const thicknessMm =
    variant.thicknessMode === "krant-binary"
      ? KRANT_THICKNESS[krantThicknessState]
      : variant.thicknessMode === "magazine-continuous"
        ? magazineThicknessMm
        : 0;

  const paperControls: PaperControls = {
    presetId: paperPresetId,
    glossOverride: paperGlossOverride,
    tintOverride: paperTintOverride,
    structureOverride: paperStructureOverride,
  };

  const paperAtlas = useOptionalTexture(PAPER_ATLAS_URL);
  useCoverFinishMaterial(coverMaterial, paperAtlas, paperControls);

  // Flat-lying variants are viewed at grazing angles; without anisotropic
  // filtering, the high-frequency cover texture (fine print text) aliases
  // into a shimmering fan/moire pattern toward the far edge of the plane.
  const { gl } = useThree();
  useEffect(() => {
    if (!coverMaterial?.map) return;
    coverMaterial.map.anisotropy = gl.capabilities.getMaxAnisotropy();
    coverMaterial.map.needsUpdate = true;
  }, [coverMaterial, coverMaterial?.map, gl]);

  const singleUrl = coverImages.single?.objectUrl;
  const leftUrl = coverImages.left?.objectUrl;
  const rightUrl = coverImages.right?.objectUrl;

  const singleTexture = useCoverTexture(variant.coverSlots === "single" ? singleUrl : undefined, {
    targetAspect: variant.targetCoverAspect,
  });
  const spreadTexture = useSpreadCoverTexture(
    variant.coverSlots === "spread" ? leftUrl : undefined,
    variant.coverSlots === "spread" ? rightUrl : undefined,
    variant.targetCoverAspect,
  );

  useEffect(() => {
    if (!coverMaterial) return;
    const activeTexture = variant.coverSlots === "single" ? singleTexture : spreadTexture;
    if (activeTexture && coverMaterial.map !== activeTexture) {
      activeTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
      coverMaterial.map = activeTexture;
      coverMaterial.needsUpdate = true;
    }
  }, [coverMaterial, singleTexture, spreadTexture, variant.coverSlots, gl]);

  useEffect(() => {
    if (!coverMesh) return;
    const halfHeight = variant.standing ? geometrySize.depth / 2 : 0;
    const center = new THREE.Vector3(0, halfHeight, 0);
    const radius = Math.max(geometrySize.width, geometrySize.depth) * 0.75;
    onBoundsChange(center, radius);
  }, [coverMesh, variant.standing, geometrySize.width, geometrySize.depth, onBoundsChange]);

  if (!coverMesh || !coverMaterial) {
    return null;
  }

  // +90deg (not -90) so the mesh's front face (originally facing +Y) ends up
  // facing +Z toward the default camera, instead of away from it.
  const groupRotation: [number, number, number] = variant.standing ? [Math.PI / 2, 0, 0] : [0, 0, 0];
  // Flat-lying variants sit at the same Y=0 as the "Infini" backdrop's floor
  // portion; a tiny lift avoids z-fighting between the two coplanar surfaces.
  const FLAT_Y_OFFSET = 0.004;
  const groupPosition: [number, number, number] = variant.standing
    ? [0, geometrySize.depth / 2, 0]
    : [0, FLAT_Y_OFFSET, 0];

  return (
    <>
      {backdrop && <primitive object={backdrop} receiveShadow />}
      <group position={groupPosition} rotation={groupRotation}>
        <primitive object={coverMesh} castShadow receiveShadow />
        {variant.thicknessMode !== "none" && (
          <PageEdge
            width={geometrySize.width}
            depth={geometrySize.depth}
            thickness={thicknessMm}
            atlasTexture={paperAtlas}
            paperControls={paperControls}
          />
        )}
      </group>
    </>
  );
}

useGLTF.preload(MODEL_SOURCES.krant.url);
useGLTF.preload(MODEL_SOURCES.magazine.url);
