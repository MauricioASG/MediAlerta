/**
 * MediAlerta design tokens.
 *
 * Medical / health palette: calm cyan for primary actions, health green for
 * positive confirmation, high-contrast slate-cyan text on a soft background.
 * No neon, no purple/pink gradients — this is a trust-first health app.
 */

export const palette = {
  // Primary — calm medical blue
  primary: '#0891B2',
  primaryDark: '#0E7490',
  primarySoft: '#CFF7FE',

  // CTA / positive — health green
  success: '#059669',
  successDark: '#047857',
  successSoft: '#D1FAE5',

  // Danger — muted, not alarming
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  dangerText: '#B91C1C',

  // Surfaces
  background: '#ECFEFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F0FBFC',

  // Text — high contrast for accessibility
  textPrimary: '#164E63',
  textSecondary: '#475569',
  textMuted: '#64748B',

  // Borders
  border: '#CBD5E1',
  borderSoft: '#E2E8F0',

  // Neutral white for text on colored surfaces
  onColor: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  full: 999,
} as const;

/** Minimum accessible touch target (WCAG). */
export const touchTarget = 44;

export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '800' as const, color: palette.textPrimary },
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, color: palette.textPrimary },
  subtitle: { fontSize: 15, color: palette.textSecondary },
  label: { fontSize: 14, fontWeight: '600' as const, color: palette.textPrimary },
  body: { fontSize: 16, color: palette.textPrimary },
} as const;
