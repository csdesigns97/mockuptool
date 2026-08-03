import { useMockupStore } from "../../state/useMockupStore";

export function ShadowToggle() {
  const shadowEnabled = useMockupStore((s) => s.shadowEnabled);
  const setShadowEnabled = useMockupStore((s) => s.setShadowEnabled);
  const shadowOpacity = useMockupStore((s) => s.shadowOpacity);
  const setShadowOpacity = useMockupStore((s) => s.setShadowOpacity);

  return (
    <div className="panel-section">
      <h3>Schaduw</h3>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={shadowEnabled}
          onChange={(e) => setShadowEnabled(e.target.checked)}
        />
        Schaduw tonen
      </label>
      {shadowEnabled && (
        <>
          <label className="field-label">Intensiteit</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={shadowOpacity}
            onChange={(e) => setShadowOpacity(Number(e.target.value))}
          />
        </>
      )}
    </div>
  );
}
