import { Suspense, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Model } from "./Model";
import { ShadowCatcher } from "./ShadowCatcher";
import { CameraRig } from "./CameraRig";
import { ExportManager } from "./ExportManager";
import { useMockupStore } from "../state/useMockupStore";
import { VARIANTS } from "../config/models.config";

const DEFAULT_CENTER = new THREE.Vector3(0, 1, 0);
const DEFAULT_RADIUS = 1.5;

export function MockupCanvas() {
  const shadowEnabled = useMockupStore((s) => s.shadowEnabled);
  const shadowOpacity = useMockupStore((s) => s.shadowOpacity);
  const standing = useMockupStore((s) => VARIANTS[s.variant].standing);

  const [bounds, setBounds] = useState<{ center: THREE.Vector3; radius: number }>({
    center: DEFAULT_CENTER,
    radius: DEFAULT_RADIUS,
  });

  const onBoundsChange = useCallback((center: THREE.Vector3, radius: number) => {
    setBounds((prev) => {
      if (prev.center.equals(center) && Math.abs(prev.radius - radius) < 1e-6) return prev;
      return { center: center.clone(), radius };
    });
  }, []);

  return (
    <Canvas
      shadows
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ fov: 35, near: 0.05, far: 100 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#00000000"]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight intensity={0.35} groundColor="#443f38" />
      <directionalLight
        position={[bounds.center.x + bounds.radius * 2, bounds.center.y + bounds.radius * 3, bounds.center.z + bounds.radius * 2]}
        intensity={1.6}
        castShadow={shadowEnabled}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-bounds.radius * 2, bounds.radius * 2, bounds.radius * 2, -bounds.radius * 2, 0.1, bounds.radius * 8]}
        />
      </directionalLight>

      <Suspense fallback={null}>
        <Model onBoundsChange={onBoundsChange} />
      </Suspense>

      {shadowEnabled && <ShadowCatcher radius={bounds.radius} y={0} opacity={shadowOpacity} />}

      <CameraRig center={bounds.center} radius={bounds.radius} standing={standing} />
      <ExportManager />
    </Canvas>
  );
}
