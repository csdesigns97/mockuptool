import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMockupStore } from "../state/useMockupStore";
import { renderToTransparentPng, resolveExportPixelSize } from "../export/useExportPng";
import { setPngPhysicalDensity } from "../export/pngPhysicalDensity";
import { downloadBlob } from "../export/downloadBlob";

/** Mounted inside <Canvas>; performs the actual PNG export when requested from the sidebar UI. */
export function ExportManager() {
  const { gl, scene, camera } = useThree();
  const exportRequestId = useMockupStore((s) => s.exportRequestId);
  const setIsExporting = useMockupStore((s) => s.setIsExporting);
  const setLastExportError = useMockupStore((s) => s.setLastExportError);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    let cancelled = false;

    (async () => {
      setIsExporting(true);
      try {
        const settings = useMockupStore.getState().exportSettings;
        const { width, height, dpi } = resolveExportPixelSize(settings);
        const blob = await renderToTransparentPng(gl, scene, camera as THREE.PerspectiveCamera, width, height);
        const finalBlob = await setPngPhysicalDensity(blob, dpi);
        if (!cancelled) downloadBlob(finalBlob, `mockup-${Date.now()}.png`);
      } catch (err) {
        if (!cancelled) setLastExportError(err instanceof Error ? err.message : "Export mislukt");
      } finally {
        if (!cancelled) setIsExporting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [exportRequestId]);

  return null;
}
