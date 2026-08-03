import { useMockupStore } from "../../state/useMockupStore";
import { CAMERA_PRESETS } from "../../config/cameraPresets.config";

export function CameraPresetButtons() {
  const activeCameraPresetId = useMockupStore((s) => s.activeCameraPresetId);
  const setActiveCameraPresetId = useMockupStore((s) => s.setActiveCameraPresetId);

  return (
    <div className="panel-section">
      <h3>Camerahoek</h3>
      <p className="hint">Sleep in de 3D-weergave om vrij te roteren, of kies een hoek:</p>
      <div className="preset-grid">
        {CAMERA_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={preset.id === activeCameraPresetId ? "segmented-btn active" : "segmented-btn"}
            onClick={() => setActiveCameraPresetId(preset.id)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
