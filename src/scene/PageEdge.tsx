import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { usePageEdgeMaterial, type PaperControls } from "./usePaperMaterial";

interface PageEdgeProps {
  /** Local-frame width (X) of the cover mesh this edge is attached to. */
  width: number;
  /** Local-frame depth (Z) of the cover mesh — becomes the "height" once the parent group stands the model up. */
  depth: number;
  /** Page-stack thickness in the same local units as width/depth. */
  thickness: number;
  /** Which side of the cover the spine/edge sits on. */
  side?: "left" | "right";
  atlasTexture?: THREE.Texture;
  paperControls: PaperControls;
}

/**
 * Procedural page-stack edge geometry. The base cover meshes are flat planes
 * with no baked depth, so thickness (both the krant's binary Normaal/Weekend
 * toggle and the magazine's continuous slider) is generated here rather than
 * sourced from the .glb. Deliberately defined in the SAME pre-rotation local
 * frame as the cover mesh, so it inherits the parent's "standing" rotation
 * for free and needs no orientation-specific branching.
 */
export function PageEdge({ width, depth, thickness, side = "left", atlasTexture, paperControls }: PageEdgeProps) {
  const material = useMemo(() => new THREE.MeshStandardMaterial(), []);
  usePageEdgeMaterial(material, atlasTexture, paperControls);

  const edgeWidth = Math.max(width * 0.035, thickness);
  const x = side === "left" ? -width / 2 - edgeWidth / 2 : width / 2 + edgeWidth / 2;

  return (
    <RoundedBox
      args={[edgeWidth, Math.max(thickness, 0.0005), depth]}
      radius={Math.min(thickness, edgeWidth) * 0.3}
      smoothness={2}
      position={[x, thickness / 2, 0]}
      material={material}
      castShadow
      receiveShadow
    />
  );
}
