import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export interface CoverFitOptions {
  targetAspect: number;
  mode?: "cover" | "contain";
}

/**
 * Computes texture.offset/repeat so an uploaded image fills (or fits) a
 * target aspect ratio, similar to CSS object-fit: cover / contain.
 */
export function computeCoverFit(
  imageWidth: number,
  imageHeight: number,
  { targetAspect, mode = "cover" }: CoverFitOptions,
): { offsetX: number; offsetY: number; repeatX: number; repeatY: number } {
  const imageAspect = imageWidth / imageHeight;

  let repeatX = 1;
  let repeatY = 1;

  const wider = imageAspect > targetAspect;
  if (mode === "cover") {
    if (wider) {
      repeatX = targetAspect / imageAspect;
    } else {
      repeatY = imageAspect / targetAspect;
    }
  } else {
    if (wider) {
      repeatY = imageAspect / targetAspect;
    } else {
      repeatX = targetAspect / imageAspect;
    }
  }

  const offsetX = (1 - repeatX) / 2;
  const offsetY = (1 - repeatY) / 2;

  return { offsetX, offsetY, repeatX, repeatY };
}

/**
 * Loads a texture from an object URL and keeps it in sync with the source
 * image / fit options, disposing the previous texture on change/unmount.
 */
export function useCoverTexture(
  objectUrl: string | undefined,
  fitOptions: CoverFitOptions,
): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const loaderRef = useRef(new THREE.TextureLoader());

  useEffect(() => {
    if (!objectUrl) {
      setTexture(null);
      return;
    }

    let cancelled = false;
    let loaded: THREE.Texture | null = null;

    loaderRef.current.load(objectUrl, (tex) => {
      if (cancelled) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.flipY = false;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;

      const image = tex.image as HTMLImageElement;
      const fit = computeCoverFit(image.naturalWidth, image.naturalHeight, fitOptions);
      tex.offset.set(fit.offsetX, fit.offsetY);
      tex.repeat.set(fit.repeatX, fit.repeatY);
      tex.needsUpdate = true;

      loaded = tex;
      setTexture(tex);
    });

    return () => {
      cancelled = true;
      loaded?.dispose();
    };
  }, [objectUrl, fitOptions.targetAspect, fitOptions.mode]);

  return texture;
}
