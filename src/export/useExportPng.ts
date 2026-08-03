import * as THREE from "three";
import type { ExportSettings } from "../state/useMockupStore";

const UNIT_TO_INCH: Record<ExportSettings["physicalUnit"], number> = {
  inch: 1,
  cm: 1 / 2.54,
  mm: 1 / 25.4,
};

export const MAX_EXPORT_DIMENSION = 8000;

export function resolveExportPixelSize(settings: ExportSettings): { width: number; height: number; dpi: number } {
  if (settings.sizeMode === "pixels") {
    return {
      width: clampDimension(settings.widthPx),
      height: clampDimension(settings.heightPx),
      dpi: settings.dpi,
    };
  }
  const widthInches = settings.physicalWidth * UNIT_TO_INCH[settings.physicalUnit];
  const heightInches = settings.physicalHeight * UNIT_TO_INCH[settings.physicalUnit];
  return {
    width: clampDimension(Math.round(widthInches * settings.dpi)),
    height: clampDimension(Math.round(heightInches * settings.dpi)),
    dpi: settings.dpi,
  };
}

function clampDimension(px: number): number {
  return Math.max(1, Math.min(MAX_EXPORT_DIMENSION, Math.round(px)));
}

/**
 * Renders the current scene to an off-screen WebGLRenderTarget at an
 * arbitrary output resolution (decoupled from the live, on-screen canvas),
 * with a transparent background, and returns a PNG blob. Supersamples and
 * downscales via a 2D canvas for consistent anti-aliasing across browsers
 * rather than relying on WebGL2 multisampled render targets.
 */
export async function renderToTransparentPng(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  targetWidth: number,
  targetHeight: number,
): Promise<Blob> {
  const superSample = targetWidth * targetHeight <= 4_000_000 ? 2 : 1;
  const renderWidth = targetWidth * superSample;
  const renderHeight = targetHeight * superSample;

  const prevTarget = gl.getRenderTarget();
  const prevAspect = camera.aspect;
  const prevClearColor = new THREE.Color();
  gl.getClearColor(prevClearColor);
  const prevClearAlpha = gl.getClearAlpha();

  const renderTarget = new THREE.WebGLRenderTarget(renderWidth, renderHeight, {
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
  });

  camera.aspect = targetWidth / targetHeight;
  camera.updateProjectionMatrix();

  gl.setRenderTarget(renderTarget);
  gl.setClearColor(0x000000, 0);
  gl.clear(true, true, true);
  gl.render(scene, camera);

  const pixelBuffer = new Uint8Array(renderWidth * renderHeight * 4);
  gl.readRenderTargetPixels(renderTarget, 0, 0, renderWidth, renderHeight, pixelBuffer);

  gl.setRenderTarget(prevTarget);
  camera.aspect = prevAspect;
  camera.updateProjectionMatrix();
  gl.setClearColor(prevClearColor, prevClearAlpha);
  renderTarget.dispose();

  // WebGL render target pixels are read bottom-up; flip rows for a normal top-down image.
  const flipped = new Uint8ClampedArray(pixelBuffer.length);
  const rowBytes = renderWidth * 4;
  for (let y = 0; y < renderHeight; y++) {
    const srcStart = y * rowBytes;
    const dstStart = (renderHeight - 1 - y) * rowBytes;
    flipped.set(pixelBuffer.subarray(srcStart, srcStart + rowBytes), dstStart);
  }

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = renderWidth;
  sourceCanvas.height = renderHeight;
  const sourceCtx = sourceCanvas.getContext("2d");
  if (!sourceCtx) throw new Error("2D canvas context unavailable");
  sourceCtx.putImageData(new ImageData(flipped, renderWidth, renderHeight), 0, 0);

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) throw new Error("2D canvas context unavailable");

  if (superSample > 1) {
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = "high";
  }
  finalCtx.drawImage(sourceCanvas, 0, 0, renderWidth, renderHeight, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    finalCanvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}
