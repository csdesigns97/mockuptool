import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CAMERA_PRESETS } from "../config/cameraPresets.config";
import { useMockupStore } from "../state/useMockupStore";

interface CameraRigProps {
  center: THREE.Vector3;
  radius: number;
  /** Flat-lying variants look wrong viewed near eye-level; bias toward a top-down angle for those. */
  standing: boolean;
}

const FLAT_MAX_POLAR_DEG = 55;

/** OrbitControls-based free rotation, plus preset framing angles applied imperatively. */
export function CameraRig({ center, radius, standing }: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();
  const activeCameraPresetId = useMockupStore((s) => s.activeCameraPresetId);

  useEffect(() => {
    const preset = CAMERA_PRESETS.find((p) => p.id === activeCameraPresetId) ?? CAMERA_PRESETS[0];
    const distance = radius * preset.distanceMultiplier;
    const azimuth = THREE.MathUtils.degToRad(preset.azimuthDeg);
    const polarDeg = standing ? preset.polarDeg : Math.min(preset.polarDeg, FLAT_MAX_POLAR_DEG);
    const polar = THREE.MathUtils.degToRad(polarDeg);

    const offset = new THREE.Vector3().setFromSpherical(new THREE.Spherical(distance, polar, azimuth));
    camera.position.copy(center).add(offset);
    camera.lookAt(center);

    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(center);
      controls.update();
    }
  }, [activeCameraPresetId, center.x, center.y, center.z, radius, standing, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[center.x, center.y, center.z]}
      enablePan={false}
      minPolarAngle={THREE.MathUtils.degToRad(12)}
      maxPolarAngle={THREE.MathUtils.degToRad(standing ? 89 : FLAT_MAX_POLAR_DEG)}
      minDistance={radius * 1.2}
      maxDistance={radius * 6}
    />
  );
}
