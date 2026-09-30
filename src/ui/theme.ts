/**
 * Design tokens (REVIEW FU3). Colors are the ones the old app used most, so the look
 * stays the same; change a value here and every screen follows.
 */
export const colors = {
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  primarySoft: "#EFF6FF",
  accent: "#526EA8",

  text: "#1F2937",
  textStrong: "#111827",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",

  background: "#FFFFFF",
  surface: "#F9FAFB",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",

  success: "#10B981",
  successSoft: "#ECFDF5",
  successText: "#065F46",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  danger: "#EF4444",
  dangerSoft: "#FEF2F2",
  dangerText: "#B91C1C",
} as const;

export const fonts = {
  light: "MontserratLight",
  regular: "MontserratRegular",
  medium: "MontserratMedium",
  semiBold: "MontserratSemiBold",
  bold: "MontserratBold",
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 6, md: 10, lg: 12, pill: 999 } as const;

export const type = {
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.text },
  heading: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  subheading: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  bodyStrong: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  label: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textMuted },
  caption: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  value: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
} as const;

export type TextVariant = keyof typeof type;
