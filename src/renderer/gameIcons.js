// ============================================================================
// CUSTOM SVG DARK-FANTASY THREE KINGDOMS GAME ICONS (NO EMOJI SLOP)
// ============================================================================

export const SVG_ICONS = {
  weapon: `
    <svg viewBox="0 0 64 64" width="34" height="34">
      <defs>
        <linearGradient id="bladeG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#dc2626"/>
        </linearGradient>
      </defs>
      <path d="M12 52 L46 18 L52 12 L48 26 L18 54 Z" fill="url(#bladeG)" stroke="#fde047" stroke-width="2"/>
      <path d="M36 14 Q56 10 54 30 Q44 22 36 14 Z" fill="#ef4444" stroke="#fde047" stroke-width="1.5"/>
      <rect x="8" y="48" width="12" height="6" rx="2" transform="rotate(-45 14 51)" fill="#facc15" stroke="#78350f" stroke-width="1.5"/>
    </svg>
  `,
  armor: `
    <svg viewBox="0 0 64 64" width="34" height="34">
      <defs>
        <linearGradient id="armG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#94a3b8"/>
          <stop offset="50%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <path d="M16 12 L26 10 L32 16 L38 10 L48 12 L54 24 L46 30 L44 52 L32 56 L20 52 L18 30 L10 24 Z" fill="url(#armG)" stroke="#f59e0b" stroke-width="2.2"/>
      <circle cx="32" cy="30" r="7" fill="#dc2626" stroke="#fde047" stroke-width="2"/>
      <path d="M20 42 L44 42" stroke="#fde047" stroke-width="2.5"/>
    </svg>
  `,
  helm: `
    <svg viewBox="0 0 64 64" width="34" height="34">
      <path d="M32 6 C18 6 12 22 14 46 L24 52 L26 36 L38 36 L40 52 L50 46 C52 22 46 6 32 6 Z" fill="#1e293b" stroke="#fbbf24" stroke-width="2.2"/>
      <path d="M22 6 Q32 -2 42 6 L32 18 Z" fill="#ef4444" stroke="#fde047" stroke-width="1.5"/>
      <path d="M14 28 L50 28" stroke="#fde047" stroke-width="2.5"/>
    </svg>
  `,
  boots: `
    <svg viewBox="0 0 64 64" width="34" height="34">
      <path d="M22 12 L38 12 L36 38 L52 44 C54 48 52 54 46 54 L18 54 L18 38 Z" fill="#451a03" stroke="#f59e0b" stroke-width="2.2"/>
      <path d="M20 20 L37 20" stroke="#fde047" stroke-width="2.5"/>
      <path d="M18 48 L50 48" stroke="#fbbf24" stroke-width="2"/>
    </svg>
  `,
  accessory: `
    <svg viewBox="0 0 64 64" width="34" height="34">
      <rect x="16" y="22" width="32" height="28" rx="4" fill="#15803d" stroke="#fde047" stroke-width="2.5"/>
      <path d="M24 22 C24 10 40 10 40 22" fill="none" stroke="#facc15" stroke-width="4"/>
      <circle cx="32" cy="36" r="7" fill="#4ade80" stroke="#fef08a" stroke-width="2"/>
    </svg>
  `,
  mount: `
    <svg viewBox="0 0 64 64" width="34" height="34">
      <path d="M14 48 L20 26 L30 12 L46 14 L52 22 L42 28 L46 48 Z" fill="#b91c1c" stroke="#fde047" stroke-width="2.2"/>
      <circle cx="38" cy="20" r="2.5" fill="#fef08a"/>
      <path d="M20 26 Q10 20 12 34" fill="none" stroke="#f97316" stroke-width="3"/>
    </svg>
  `,
  goldIngot: `
    <svg viewBox="0 0 32 32" width="18" height="18" style="vertical-align:middle">
      <path d="M4 18 L10 10 L22 10 L28 18 C26 24 6 24 4 18 Z" fill="#facc15" stroke="#92400e" stroke-width="1.8"/>
      <ellipse cx="16" cy="13" rx="6" ry="3" fill="#fef08a"/>
    </svg>
  `,
  ironCrystal: `
    <svg viewBox="0 0 32 32" width="18" height="18" style="vertical-align:middle">
      <polygon points="16,3 26,12 22,28 10,28 6,12" fill="#38bdf8" stroke="#0284c7" stroke-width="1.8"/>
      <polygon points="16,5 22,12 16,25 11,12" fill="#bae6fd"/>
    </svg>
  `,
  captureSeal: `
    <svg viewBox="0 0 32 32" width="18" height="18" style="vertical-align:middle">
      <circle cx="16" cy="16" r="12" fill="#991b1b" stroke="#fde047" stroke-width="2"/>
      <circle cx="16" cy="16" r="8" fill="none" stroke="#fca5a5" stroke-width="1" stroke-dasharray="2,2"/>
    </svg>
  `,
  forgeAnvil: `
    <svg viewBox="0 0 32 32" width="16" height="16" style="vertical-align:middle">
      <path d="M6 12 L26 12 L22 18 L25 26 L7 26 L10 18 Z" fill="#94a3b8" stroke="#fde047" stroke-width="1.5"/>
    </svg>
  `,
};

export function getSlotSvgIcon(slotId) {
  return SVG_ICONS[slotId] || SVG_ICONS.weapon;
}
