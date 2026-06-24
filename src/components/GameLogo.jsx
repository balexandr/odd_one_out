export function GameLogo() {
  return (
    <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="13" cy="13" r="9" fill="rgba(255,255,255,0.2)" />
      <circle cx="35" cy="13" r="9" fill="rgba(255,255,255,0.2)" />
      <circle cx="13" cy="35" r="9" fill="rgba(255,255,255,0.2)" />
      <polygon points="35,26 44,44 26,44" fill="#ff6b35" />
    </svg>
  );
}
