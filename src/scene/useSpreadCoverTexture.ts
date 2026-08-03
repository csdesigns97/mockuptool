import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const RENDER_HEIGHT = 2048;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const boxAspect = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  if (imgAspect > boxAspect) {
    sw = img.naturalHeight * boxAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / boxAspect;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/**
 * Composites separate left/right page images into a single canvas texture
 * for spread (opened) variants, each half individually "cover"-fit into its
 * page slot. Keeps the rest of the material pipeline identical to the
 * single-cover case (one texture assigned to material.map).
 */
export function useSpreadCoverTexture(
  leftUrl: string | undefined,
  rightUrl: string | undefined,
  targetAspect: number,
): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  textureRef.current = texture;

  useEffect(() => {
    if (!leftUrl && !rightUrl) {
      setTexture(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const width = Math.round(RENDER_HEIGHT * targetAspect);
      const height = RENDER_HEIGHT;
      const canvas = canvasRef.current ?? document.createElement("canvas");
      canvasRef.current = canvas;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#d9d5c9";
      ctx.fillRect(0, 0, width, height);

      const [leftImg, rightImg] = await Promise.all([
        leftUrl ? loadImage(leftUrl) : Promise.resolve(null),
        rightUrl ? loadImage(rightUrl) : Promise.resolve(null),
      ]);
      if (cancelled) return;

      if (leftImg) drawCover(ctx, leftImg, 0, 0, width / 2, height);
      if (rightImg) drawCover(ctx, rightImg, width / 2, 0, width / 2, height);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.flipY = false;
      tex.needsUpdate = true;
      setTexture((prev) => {
        if (prev) prev.dispose();
        return tex;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [leftUrl, rightUrl, targetAspect]);

  useEffect(() => {
    return () => {
      textureRef.current?.dispose();
    };
  }, []);

  return texture;
}
