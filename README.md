# Mockuptool

Client-side webapp om 3D packshot-mockups te maken van kranten en magazines: cover uploaden, plaatsen op het juiste vlak van het 3D-model, dikte en papiertype aanpassen, roteren, schaduw aan/uit zetten, en exporteren als transparante PNG op een zelf opgegeven resolutie (breedte/hoogte/DPI).

Geen backend — alles gebeurt in de browser. Zie `/root/.claude/plans/ik-wil-een-online-clever-zebra.md` (of de sessiegeschiedenis) voor het volledige architectuurplan.

## Stack

React + TypeScript + Vite + [`@react-three/fiber`](https://docs.pmnd.rs/react-three-fiber) + [`@react-three/drei`](https://github.com/pmndrs/drei) (Three.js), `zustand` voor state, `react-colorful` voor de kleurkiezer.

## Development

```bash
npm install
npm run dev      # dev server
npm run build    # productie-build (tsc + vite build)
npm run lint      # oxlint
```

## Projectstructuur

```
public/models/       krant.glb, magazine.glb (Blender glTF-export)
public/textures/      paper-types-atlas.jpg (papiertype-textuur, uit de .glb geëxtraheerd)
src/
  config/            model-manifest, papier-presets, camera-presets
  state/             zustand store
  scene/             3D-scene: model laden, cover-texture, papier-materiaal, dikte, schaduw, camera
  export/            PNG-exportpipeline (render target → canvas → PNG + DPI-metadata)
  ui/Sidebar/        alle bedieningspanelen
  utils/             glTF-introspectie, asset-validatie
```

## 3D-modellen: aanleverings-contract voor Blender

De app gaat ervan uit dat elk model (`krant.glb`, `magazine.glb`) een specifieke node-structuur bevat. Bij een nieuwe export vanuit Blender:

1. **Node-namen moeten overeenkomen met `src/config/models.config.ts`** (`coverNodeName`, `coverMaterialName`, `shadowCatcherNodeName`, `backdropNodeName` per variant). Wijzig je namen in Blender, werk dan ook de config bij.
2. **UV-laag**: glTF-export gebruikt altijd de *actieve* UV-laag als `TEXCOORD_0` — de naam van die laag in Blender maakt niet uit voor de webapp. Zorg gewoon dat de juiste laag actief staat vóór export.
3. **Export-instellingen**: zet **"Include → Selected Objects" UIT** (of exporteer een dedicated Collection met alle benodigde objecten in één keer) — met deze optie aan werd bij eerdere exports per ongeluk maar 1 object meegenomen, wat leidde tot lege varianten. Zie de asset-gaps hieronder.
4. **Materialen**: houd texturen **ingebakken** in de `.glb` (geen aparte `.bin`/textuurbestanden). De cover-textuur (`baseColorTexture`) wordt door de app volledig vervangen door de upload van de gebruiker; de exacte pixels ervan in het model maken niet uit.
5. **Custom shader-node-graphs (Attribute-nodes, Mix/Bump-ketens) exporteren niet mee naar glTF** — enkel de resulterende statische PBR-waarden en de ruwe textuurbestanden. De papier-look (glans/mat, papierstructuur, papiertype) wordt daarom in de webapp zelf opnieuw opgebouwd (`src/scene/usePaperMaterial.ts`), losgekoppeld van Blender's shader-logica.
6. **Transforms toepassen** (Ctrl+A) vóór export, model op reële schaal (meters) — de app leidt dikte/camera-framing af uit de bounding box van de mesh.

### Bekende asset-gaps (nog aan te leveren)

- `Krant-Spread` (opengeslagen krant) — node bestaat, mesh ontbreekt.
- `Magazine-Gebonden` en `Magazine-Geniet` (gesloten magazine-varianten) — nodes bestaan, mesh ontbreekt.

Zolang deze ontbreken toont de variant-selector ze als uitgeschakeld ("asset ontbreekt"); dev-console toont een duidelijke waarschuwing via `assetValidation.ts`.

## Architecturale keuzes, kort

- **Dikte** is volledig procedureel (`src/scene/PageEdge.tsx`) — de bron-meshes zijn platte vlakken zonder gemodelleerde diepte. Krant: 2 vaste standen (Normaal/Weekend). Magazine: continue slider.
- **Papiertype-atlas** (`public/textures/paper-types-atlas.jpg`) is een 2×2-grid geëxtraheerd uit de originele `.glb`: glans / recycled / mat / krantenpapier.
- **Schaduw** gebruikt `THREE.ShadowMaterial` op een grondvlak — componeert van nature correct tegen een transparante achtergrond (geen aparte render-pass nodig).
- **Export** rendert naar een losstaand `WebGLRenderTarget` op de opgegeven resolutie (onafhankelijk van de zichtbare canvas), met 2× supersampling + downscale voor anti-aliasing, en patcht zelf een `pHYs`-chunk in de PNG voor DPI-metadata (browsers bieden hiervoor geen native API).
