import { useMockupStore } from "../../state/useMockupStore";
import { VARIANTS, MAGAZINE_THICKNESS_RANGE } from "../../config/models.config";

export function ThicknessControl() {
  const variant = useMockupStore((s) => VARIANTS[s.variant]);
  const krantThicknessState = useMockupStore((s) => s.krantThicknessState);
  const setKrantThicknessState = useMockupStore((s) => s.setKrantThicknessState);
  const magazineThicknessMm = useMockupStore((s) => s.magazineThicknessMm);
  const setMagazineThicknessMm = useMockupStore((s) => s.setMagazineThicknessMm);

  if (variant.thicknessMode === "none") return null;

  return (
    <div className="panel-section">
      <h3>Dikte</h3>
      {variant.thicknessMode === "krant-binary" ? (
        <div className="segmented">
          <button
            type="button"
            className={krantThicknessState === "normaal" ? "segmented-btn active" : "segmented-btn"}
            onClick={() => setKrantThicknessState("normaal")}
          >
            Normaal
          </button>
          <button
            type="button"
            className={krantThicknessState === "weekend" ? "segmented-btn active" : "segmented-btn"}
            onClick={() => setKrantThicknessState("weekend")}
          >
            Weekend
          </button>
        </div>
      ) : (
        <>
          <input
            type="range"
            min={MAGAZINE_THICKNESS_RANGE.min}
            max={MAGAZINE_THICKNESS_RANGE.max}
            step={0.001}
            value={magazineThicknessMm}
            onChange={(e) => setMagazineThicknessMm(Number(e.target.value))}
          />
          <span className="field-value">{Math.round(magazineThicknessMm * 1000)} (relatief)</span>
        </>
      )}
    </div>
  );
}
