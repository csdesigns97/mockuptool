import type { ReactNode } from "react";
import type { VariantKey } from "../types/model.types";
import { ModelTypeSelector } from "./Sidebar/ModelTypeSelector";
import { CoverUploader } from "./Sidebar/CoverUploader";
import { ThicknessControl } from "./Sidebar/ThicknessControl";
import { PaperControls } from "./Sidebar/PaperControls";
import { ShadowToggle } from "./Sidebar/ShadowToggle";
import { CameraPresetButtons } from "./Sidebar/CameraPresetButtons";
import { ExportPanel } from "./Sidebar/ExportPanel";

interface LayoutProps {
  canvas: ReactNode;
  variantAvailability: Record<VariantKey, boolean> | null;
}

export function Layout({ canvas, variantAvailability }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Mockuptool</h1>
        <p>3D mockups voor kranten &amp; magazines</p>
      </header>
      <div className="app-body">
        <main className="canvas-area">{canvas}</main>
        <aside className="sidebar">
          <ModelTypeSelector variantAvailability={variantAvailability} />
          <CoverUploader />
          <ThicknessControl />
          <PaperControls />
          <ShadowToggle />
          <CameraPresetButtons />
          <ExportPanel />
        </aside>
      </div>
    </div>
  );
}
