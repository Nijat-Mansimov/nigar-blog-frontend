/**
 * PROTECTED THEME CONFIGURATION
 * This file defines all color tokens and design system values.
 * Do not modify these values outside of conscious design decisions.
 */

export const THEME_COLORS = Object.freeze({
  // Primary color palette (Typography & Ink)
  ink: "0 0% 4%",
  paper: "40 15% 97%",
  rule: "0 0% 75%",

  // Background & Surface colors
  background: "40 15% 97%",
  foreground: "0 0% 4%",
  card: "40 10% 95%",
  cardForeground: "0 0% 4%",
  popover: "40 10% 95%",
  popoverForeground: "0 0% 4%",

  // Interactive colors
  primary: "0 0% 4%",
  primaryForeground: "40 15% 97%",
  secondary: "0 0% 92%",
  secondaryForeground: "0 0% 4%",

  // State colors
  muted: "0 0% 88%",
  mutedForeground: "0 0% 40%",
  accent: "0 0% 12%",
  accentForeground: "40 15% 97%",

  // Feedback colors
  destructive: "0 84% 60%",
  destructiveForeground: "0 0% 98%",

  // Borders & Inputs
  border: "0 0% 80%",
  input: "0 0% 80%",
  ring: "0 0% 4%",

  // Sidebar (if needed)
  sidebarBackground: "0 0% 98%",
  sidebarForeground: "240 5.3% 26.1%",
  sidebarPrimary: "240 5.9% 10%",
  sidebarPrimaryForeground: "0 0% 98%",
  sidebarAccent: "240 4.8% 95.9%",
  sidebarAccentForeground: "240 5.9% 10%",
  sidebarBorder: "220 13% 91%",
  sidebarRing: "217.2 91.2% 59.8%",
});

export const THEME_FONTS = Object.freeze({
  headline: "'Playfair Display', Georgia, serif",
  body: "'EB Garamond', Georgia, serif",
  sans: "'Inter', sans-serif",
});

export const THEME_TYPOGRAPHY = Object.freeze({
  radius: "0rem",
  baseFontFamily: "'EB Garamond', Georgia, serif",
});

/**
 * Theme version - increment when making intentional breaking changes
 * This helps track theme consistency across versions
 */
export const THEME_VERSION = "1.0.0";

/**
 * Immutable theme definition - frozen to prevent modification
 */
export const PROTECTED_THEME = Object.freeze({
  colors: THEME_COLORS,
  fonts: THEME_FONTS,
  typography: THEME_TYPOGRAPHY,
  version: THEME_VERSION,
});
