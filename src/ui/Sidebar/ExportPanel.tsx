import { useMockupStore, type PhysicalUnit, type SizeMode } from "../../state/useMockupStore";
import { MAX_EXPORT_DIMENSION } from "../../export/useExportPng";

export function ExportPanel() {
  const settings = useMockupStore((s) => s.exportSettings);
  const setExportSettings = useMockupStore((s) => s.setExportSettings);
  const isExporting = useMockupStore((s) => s.isExporting);
  const lastExportError = useMockupStore((s) => s.lastExportError);
  const requestExport = useMockupStore((s) => s.requestExport);

  return (
    <div className="panel-section">
      <h3>Export</h3>

      <div className="segmented">
        <button
          type="button"
          className={settings.sizeMode === "pixels" ? "segmented-btn active" : "segmented-btn"}
          onClick={() => setExportSettings({ sizeMode: "pixels" satisfies SizeMode })}
        >
          Pixels
        </button>
        <button
          type="button"
          className={settings.sizeMode === "physical" ? "segmented-btn active" : "segmented-btn"}
          onClick={() => setExportSettings({ sizeMode: "physical" satisfies SizeMode })}
        >
          Fysieke maat + DPI
        </button>
      </div>

      {settings.sizeMode === "pixels" ? (
        <div className="field-row">
          <label>
            Breedte (px)
            <input
              type="number"
              min={1}
              max={MAX_EXPORT_DIMENSION}
              value={settings.widthPx}
              onChange={(e) => setExportSettings({ widthPx: Number(e.target.value) })}
            />
          </label>
          <label>
            Hoogte (px)
            <input
              type="number"
              min={1}
              max={MAX_EXPORT_DIMENSION}
              value={settings.heightPx}
              onChange={(e) => setExportSettings({ heightPx: Number(e.target.value) })}
            />
          </label>
        </div>
      ) : (
        <>
          <div className="field-row">
            <label>
              Breedte
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={settings.physicalWidth}
                onChange={(e) => setExportSettings({ physicalWidth: Number(e.target.value) })}
              />
            </label>
            <label>
              Hoogte
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={settings.physicalHeight}
                onChange={(e) => setExportSettings({ physicalHeight: Number(e.target.value) })}
              />
            </label>
            <label>
              Eenheid
              <select
                value={settings.physicalUnit}
                onChange={(e) => setExportSettings({ physicalUnit: e.target.value as PhysicalUnit })}
              >
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="inch">inch</option>
              </select>
            </label>
          </div>
        </>
      )}

      <label className="field-label">DPI</label>
      <input
        type="number"
        min={72}
        max={1200}
        value={settings.dpi}
        onChange={(e) => setExportSettings({ dpi: Number(e.target.value) })}
      />

      <button type="button" className="export-btn" disabled={isExporting} onClick={() => requestExport()}>
        {isExporting ? "Bezig met exporteren…" : "Exporteer PNG"}
      </button>

      {lastExportError && <p className="error-text">{lastExportError}</p>}
    </div>
  );
}
