export function TitleLogo() {
  const font = "'Bebas Neue', sans-serif"
  const fs = 40
  const ls = 2
  const y = 41

  return (
    <svg
      viewBox="0 0 232 52"
      height="36"
      aria-label="Odd One Out"
      style={{ overflow: 'visible', display: 'block', flexShrink: 0 }}
    >
      {/* ODD — plain, nothing special */}
      <text x="38" y={y} textAnchor="middle" fontFamily={font} fontSize={fs} letterSpacing={ls} fill="white">ODD</text>

      {/* ONE — crop-mark corners: it's been identified as the odd one */}
      <path d="M 93 7 L 81 7 L 81 19"   fill="none" stroke="#ff6b35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 139 7 L 151 7 L 151 19" fill="none" stroke="#ff6b35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 81 35 L 81 47 L 93 47"   fill="none" stroke="#ff6b35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 151 35 L 151 47 L 139 47" fill="none" stroke="#ff6b35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="116" y={y} textAnchor="middle" fontFamily={font} fontSize={fs} letterSpacing={ls} fill="#ff6b35">ONE</text>

      {/* OUT — plain, matches ODD */}
      <text x="194" y={y} textAnchor="middle" fontFamily={font} fontSize={fs} letterSpacing={ls} fill="white">OUT</text>
    </svg>
  )
}
