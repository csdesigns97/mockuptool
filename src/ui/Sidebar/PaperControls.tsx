import { HexColorPicker } from "react-colorful";
import { useState } from "react";
import { useMockupStore } from "../../state/useMockupStore";
import { PAPER_PRESETS } from "../../config/paperPresets.config";
import type { PaperPresetId } from "../../types/model.types";

export function PaperControls() {
  const presetId = useMockupStore((s) => s.paperPresetId);
  const setPaperPresetId = useMockupStore((s) => s.setPaperPresetId);
  const glossOverride = useMockupStore((s) => s.paperGlossOverride);
  const setPaperGlossOverride = useMockupStore((s) => s.setPaperGlossOverride);
  const tintOverride = useMockupStore((s) => s.paperTintOverride);
  const setPaperTintOverride = useMockupStore((s) => s.setPaperTintOverride);
  const structureOverride = useMockupStore((s) => s.paperStructureOverride);
  const setPaperStructureOverride = useMockupStore((s) => s.setPaperStructureOverride);

  const [showTintPicker, setShowTintPicker] = useState(false);

  const preset = PAPER_PRESETS[presetId];
  const effectiveTint = tintOverride ?? preset.tintColor;

  return (
    <div className="panel-section">
      <h3>Papier</h3>

      <label className="field-label">Papiertype</label>
      <select
        value={presetId}
        onChange={(e) => {
          setPaperPresetId(e.target.value as PaperPresetId);
          setPaperTintOverride(null);
        }}
      >
        {Object.values(PAPER_PRESETS).map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>

      <label className="field-label">Glans / mat</label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={glossOverride ?? 0.5}
        onChange={(e) => setPaperGlossOverride(Number(e.target.value))}
      />
      {glossOverride !== null && (
        <button type="button" className="link-btn" onClick={() => setPaperGlossOverride(null)}>
          Terug naar preset
        </button>
      )}

      <label className="field-label">Paginarand-tint</label>
      <div className="swatch-row">
        <button
          type="button"
          className="swatch"
          style={{ background: effectiveTint }}
          onClick={() => setShowTintPicker((v) => !v)}
        />
        {tintOverride !== null && (
          <button type="button" className="link-btn" onClick={() => setPaperTintOverride(null)}>
            Terug naar preset
          </button>
        )}
      </div>
      {showTintPicker && (
        <HexColorPicker color={effectiveTint} onChange={setPaperTintOverride} />
      )}

      <label className="field-label">Papierstructuur</label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={structureOverride ?? 0.25}
        onChange={(e) => setPaperStructureOverride(Number(e.target.value))}
      />
      {structureOverride !== null && (
        <button type="button" className="link-btn" onClick={() => setPaperStructureOverride(null)}>
          Terug naar preset
        </button>
      )}
    </div>
  );
}
