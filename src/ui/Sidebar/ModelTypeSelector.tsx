import { useMockupStore } from "../../state/useMockupStore";
import { VARIANTS_BY_MODEL } from "../../config/models.config";
import type { ModelKey, VariantKey } from "../../types/model.types";

interface Props {
  variantAvailability: Record<VariantKey, boolean> | null;
}

const MODEL_LABELS: Record<ModelKey, string> = { krant: "Krant", magazine: "Magazine" };

export function ModelTypeSelector({ variantAvailability }: Props) {
  const modelType = useMockupStore((s) => s.modelType);
  const variant = useMockupStore((s) => s.variant);
  const setModelType = useMockupStore((s) => s.setModelType);
  const setVariant = useMockupStore((s) => s.setVariant);

  return (
    <div className="panel-section">
      <h3>Model</h3>
      <div className="segmented">
        {(Object.keys(MODEL_LABELS) as ModelKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={key === modelType ? "segmented-btn active" : "segmented-btn"}
            onClick={() => {
              setModelType(key);
              const firstVariant = VARIANTS_BY_MODEL[key][0];
              setVariant(firstVariant.key);
            }}
          >
            {MODEL_LABELS[key]}
          </button>
        ))}
      </div>

      <label className="field-label" htmlFor="variant-select">
        Variant
      </label>
      <select
        id="variant-select"
        value={variant}
        onChange={(e) => setVariant(e.target.value as VariantKey)}
      >
        {VARIANTS_BY_MODEL[modelType].map((v) => {
          const available = variantAvailability?.[v.key] ?? true;
          return (
            <option key={v.key} value={v.key} disabled={!available}>
              {v.label}
              {!available ? " (asset ontbreekt)" : ""}
            </option>
          );
        })}
      </select>
    </div>
  );
}
