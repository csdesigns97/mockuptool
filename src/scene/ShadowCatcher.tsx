interface ShadowCatcherProps {
  radius: number;
  y: number;
  opacity: number;
}

/**
 * Ground plane that only renders the shadow it receives, using
 * THREE.ShadowMaterial (exposed here as <shadowMaterial>). Its alpha equals
 * the computed shadow darkness, so it composites correctly against a
 * transparent PNG export with no extra render pass. Toggling the "shadow"
 * feature is simply mounting/unmounting this component.
 */
export function ShadowCatcher({ radius, y, opacity }: ShadowCatcherProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <planeGeometry args={[radius * 6, radius * 6]} />
      <shadowMaterial transparent opacity={opacity} />
    </mesh>
  );
}
