import type { ModelSource, VariantConfig, VariantKey } from "../types/model.types";

export const MODEL_SOURCES: Record<"krant" | "magazine", ModelSource> = {
  krant: { key: "krant", label: "Krant", url: "/models/krant.glb" },
  magazine: { key: "magazine", label: "Magazine", url: "/models/magazine.glb" },
};

// Typical newspaper front page / magazine cover trim aspect ratios (width / height).
// These are defaults derived from the source plane geometry being a 2x2 unit square;
// tune once real print trim sizes are confirmed with the client.
const NEWSPAPER_ASPECT = 0.72;
const MAGAZINE_ASPECT = 0.77;

export const VARIANTS: Record<VariantKey, VariantConfig> = {
  "krant-plat": {
    key: "krant-plat",
    modelKey: "krant",
    label: "Plat liggend",
    coverNodeName: "Krant-Rechtopstaand",
    coverMaterialName: "Krant-Cover",
    coverSlots: "single",
    standing: false,
    thicknessMode: "krant-binary",
    spineAxis: "x",
    targetCoverAspect: NEWSPAPER_ASPECT,
    shadowCatcherNodeName: "ShadowCatcher",
    backdropNodeName: "Infini",
  },
  "krant-rechtopstaand": {
    key: "krant-rechtopstaand",
    modelKey: "krant",
    label: "Gevouwen / rechtopstaand",
    coverNodeName: "Krant-Rechtopstaand",
    coverMaterialName: "Krant-Cover",
    coverSlots: "single",
    standing: true,
    thicknessMode: "krant-binary",
    spineAxis: "x",
    targetCoverAspect: NEWSPAPER_ASPECT,
    shadowCatcherNodeName: "ShadowCatcher",
    backdropNodeName: "Infini",
  },
  "krant-spread": {
    key: "krant-spread",
    modelKey: "krant",
    label: "Opengeslagen",
    coverNodeName: "Krant-Spread",
    coverMaterialName: "Krant-Spread-Cover",
    coverSlots: "spread",
    standing: false,
    thicknessMode: "none",
    spineAxis: "x",
    targetCoverAspect: NEWSPAPER_ASPECT * 2,
    shadowCatcherNodeName: "ShadowCatcher",
    backdropNodeName: "Infini",
  },
  "magazine-gebonden": {
    key: "magazine-gebonden",
    modelKey: "magazine",
    label: "Gesloten (gebonden)",
    coverNodeName: "Magazine-Gebonden",
    coverMaterialName: "Magazine-Gebonden-Cover",
    coverSlots: "single",
    standing: true,
    thicknessMode: "magazine-continuous",
    spineAxis: "x",
    targetCoverAspect: MAGAZINE_ASPECT,
    shadowCatcherNodeName: "ShadowCatcher",
    backdropNodeName: "Infini",
  },
  "magazine-geniet": {
    key: "magazine-geniet",
    modelKey: "magazine",
    label: "Gesloten (geniet)",
    coverNodeName: "Magazine-Geniet",
    coverMaterialName: "Magazine-Geniet-Cover",
    coverSlots: "single",
    standing: true,
    thicknessMode: "magazine-continuous",
    spineAxis: "x",
    targetCoverAspect: MAGAZINE_ASPECT,
    shadowCatcherNodeName: "ShadowCatcher",
    backdropNodeName: "Infini",
  },
  "magazine-spread": {
    key: "magazine-spread",
    modelKey: "magazine",
    label: "Opengeslagen",
    coverNodeName: "Magazine-Spread",
    coverMaterialName: "Spread-Magazine-L",
    coverSlots: "spread",
    standing: false,
    thicknessMode: "none",
    spineAxis: "x",
    targetCoverAspect: MAGAZINE_ASPECT * 2,
    shadowCatcherNodeName: "ShadowCatcher",
    backdropNodeName: "Infini",
  },
};

export const VARIANTS_BY_MODEL: Record<"krant" | "magazine", VariantConfig[]> = {
  krant: [VARIANTS["krant-plat"], VARIANTS["krant-rechtopstaand"], VARIANTS["krant-spread"]],
  magazine: [VARIANTS["magazine-gebonden"], VARIANTS["magazine-geniet"], VARIANTS["magazine-spread"]],
};

// Krant thickness (binary) — millimeters, expressed in the model's own unit scale.
export const KRANT_THICKNESS: Record<"normaal" | "weekend", number> = {
  normaal: 0.015,
  weekend: 0.05,
};

// Magazine thickness (continuous) range — millimeters, in model unit scale.
export const MAGAZINE_THICKNESS_RANGE = {
  min: 0.01,
  max: 0.08,
  default: 0.03,
};
