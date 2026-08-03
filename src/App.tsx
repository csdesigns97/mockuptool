import { useEffect, useState } from "react";
import { Layout } from "./ui/Layout";
import { MockupCanvas } from "./scene/MockupCanvas";
import { loadVariantAvailability } from "./utils/loadVariantAvailability";
import type { VariantKey } from "./types/model.types";

function App() {
  const [variantAvailability, setVariantAvailability] = useState<Record<VariantKey, boolean> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadVariantAvailability()
      .then((result) => {
        if (!cancelled) setVariantAvailability(result);
      })
      .catch((err) => {
        console.error("[App] Kon asset-beschikbaarheid niet controleren:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <Layout canvas={<MockupCanvas />} variantAvailability={variantAvailability} />;
}

export default App;
