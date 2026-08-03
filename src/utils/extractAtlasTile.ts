import * as THREE from "three";
import { PAPER_ATLAS_GRID } from "../config/paperPresets.config";

const croppedCanvasCache = new Map<number, HTMLCanvasElement>();

/**
 * Crops a single tile out of the shared paper-types-atlas image into its own
 * canvas, so each consumer (cover structure map vs. page-edge color map) can
 * apply independent repeat/offset without fighting over a shared texture's
 * transform.
 */
export function extractAtlasTile(source: THREE.Texture, tileIndex: number): THREE.Texture | undefined {
  const image = source.image as { width?: number; height?: number } | undefined;
  if (!image?.width || !image.height) return undefined;

  let canvas = croppedCanvasCache.get(tileIndex);
  if (!canvas) {
    const { cols, rows } = PAPER_ATLAS_GRID;
    const col = tileIndex % cols;
    const rowFromTop = Math.floor(tileIndex / cols);
    const tileW = image.width / cols;
    const tileH = image.height / rows;

    canvas = document.createElement("canvas");
    canvas.width = tileW;
    canvas.height = tileH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(image as CanvasImageSource, col * tileW, rowFromTop * tileH, tileW, tileH, 0, 0, tileW, tileH);
    croppedCanvasCache.set(tileIndex, canvas);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = source.colorSpace;
  return tex;
}
