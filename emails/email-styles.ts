import type { CSSProperties } from "react"

/**
 * Shared styling for transactional emails.
 *
 * Why this file exists:
 * - Email clients are inconsistent and often ignore modern CSS.
 * - `react-email` recommends inline styles for maximum compatibility.
 * - Centralising our inline style objects keeps the brand consistent and
 *   makes future tweaks (spacing, colours, typography) safe and fast.
 *
 * Design approach:
 * - `emailTokens` captures the small set of brand primitives.
 * - `submitterEmailStyles` is the baseline (preferred) styling source.
 * - `adminEmailStyles` reuses the baseline but overrides where admin needs a
 *   different layout and adds admin-only styles.
 */

export const emailTokens = {
  colors: {
    background: "#f8f9fa",
    surface: "#ffffff",
    surfaceMuted: "#f7fafc",
    border: "#e2e8f0",
    heading: "#1a202c",
    text: "#2d3748",
    textMuted: "#718096",
    textSubtle: "#a0aec0",
    brand: "#667eea",
    brandGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    adminGradient: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
    success: "#38a169",
    danger: "#e53e3e",
  },
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  radius: {
    lg: "12px",
    md: "8px",
    sm: "6px",
  },
} as const

export const submitterEmailStyles = {
  // Layout primitives
  main: {
    backgroundColor: emailTokens.colors.background,
    fontFamily: emailTokens.fontFamily,
  } satisfies CSSProperties,

  container: {
    // This is the preferred "new" submitter layout the project wants as baseline.
    margin: "0.5rem auto",
    padding: "0.5rem",
    maxWidth: "600px",
  } satisfies CSSProperties,

  // Header
  header: {
    background: emailTokens.colors.brandGradient,
    borderRadius: `${emailTokens.radius.lg} ${emailTokens.radius.lg} 0 0`,
    padding: "40px 32px",
    textAlign: "center",
  } satisfies CSSProperties,

  headerTitle: {
    margin: "0",
    color: emailTokens.colors.surface,
    fontSize: "28px",
    fontWeight: "600",
    letterSpacing: "-0.5px",
    lineHeight: "1.2",
  } satisfies CSSProperties,

  headerSubtitle: {
    margin: "12px 0 0",
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "16px",
  } satisfies CSSProperties,

  // Body content
  content: {
    backgroundColor: emailTokens.colors.surface,
    padding: "2rem 1rem",
    borderRadius: `0 0 ${emailTokens.radius.lg} ${emailTokens.radius.lg}`,
  } satisfies CSSProperties,

  paragraph: {
    margin: "0 0 24px",
    color: "#4a5568",
    fontSize: "16px",
    lineHeight: "1.6",
  } satisfies CSSProperties,

  // Endorsement preview card
  card: {
    backgroundColor: emailTokens.colors.surfaceMuted,
    border: `1px solid ${emailTokens.colors.border}`,
    borderRadius: emailTokens.radius.md,
    padding: "24px",
    margin: "24px 0",
  } satisfies CSSProperties,

  cardLabel: {
    margin: "0 0 8px",
    color: emailTokens.colors.textMuted,
    fontSize: "14px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  } satisfies CSSProperties,

  quote: {
    margin: "0 0 16px",
    color: emailTokens.colors.text,
    fontSize: "15px",
    lineHeight: "1.7",
    fontStyle: "italic",
  } satisfies CSSProperties,

  cardMeta: {
    margin: "0",
    color: emailTokens.colors.textMuted,
    fontSize: "14px",
  } satisfies CSSProperties,

  /**
   * Simple 2-column details table styling, used in a few templates for
   * "what changed" / metadata style rows.
   *
   * Note: table layout is still the most reliable option across email clients.
   */
  detailsTable: {
    width: "100%",
    borderCollapse: "collapse",
  } satisfies CSSProperties,

  detailsLabelCell: {
    padding: "8px 0",
    color: emailTokens.colors.textMuted,
    fontSize: "14px",
    fontWeight: 600,
    width: "34%",
    verticalAlign: "top",
  } satisfies CSSProperties,

  detailsValueCell: {
    padding: "8px 0",
    color: emailTokens.colors.text,
    fontSize: "14px",
  } satisfies CSSProperties,

  /**
   * Highlight block for lifecycle updates (e.g. approval).
   * Kept intentionally subtle and “on brand”, while still being visually distinct.
   */
  statusCardApproved: {
    backgroundColor: emailTokens.colors.surfaceMuted,
    border: `1px solid ${emailTokens.colors.border}`,
    borderLeft: `4px solid ${emailTokens.colors.success}`,
    borderRadius: emailTokens.radius.md,
    padding: "16px",
    margin: "24px 0",
  } satisfies CSSProperties,

  statusCardTitle: {
    margin: "0 0 8px",
    color: emailTokens.colors.heading,
    fontSize: "16px",
    fontWeight: "600",
  } satisfies CSSProperties,

  statusCardBody: {
    margin: "0",
    color: "#4a5568",
    fontSize: "14px",
    lineHeight: "1.6",
  } satisfies CSSProperties,

  // CTA
  buttonContainer: {
    textAlign: "center",
    margin: "32px 0",
  } satisfies CSSProperties,

  button: {
    backgroundColor: emailTokens.colors.brand,
    color: emailTokens.colors.surface,
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "14px 32px",
    borderRadius: emailTokens.radius.md,
    display: "inline-block",
  } satisfies CSSProperties,

  // Footer
  footerText: {
    margin: "24px 0 0",
    color: emailTokens.colors.textMuted,
    fontSize: "14px",
    lineHeight: "1.6",
  } satisfies CSSProperties,

  footer: {
    backgroundColor: emailTokens.colors.surfaceMuted,
    padding: "24px 32px",
    textAlign: "center",
  } satisfies CSSProperties,

  hr: {
    border: "none",
    borderTop: `1px solid ${emailTokens.colors.border}`,
    margin: "0 0 24px",
  } satisfies CSSProperties,

  footerSignature: {
    margin: "0 0 8px",
    color: emailTokens.colors.textMuted,
    fontSize: "14px",
  } satisfies CSSProperties,

  footerName: {
    margin: "0",
    color: "#4a5568",
    fontSize: "14px",
    fontWeight: "600",
  } satisfies CSSProperties,

  footerLink: {
    margin: "16px 0 0",
    color: emailTokens.colors.brand,
    fontSize: "12px",
    textDecoration: "none",
  } satisfies CSSProperties,

  legal: {
    textAlign: "center",
    margin: "24px 0 0",
  } satisfies CSSProperties,

  legalText: {
    margin: "0",
    color: emailTokens.colors.textSubtle,
    fontSize: "12px",
    lineHeight: "1.5",
  } satisfies CSSProperties,
} as const

export const adminEmailStyles = {
  ...submitterEmailStyles,

  // Admin container is wider and card-like.
  container: {
    margin: "40px auto",
    padding: "0 20px",
    maxWidth: "700px",
    backgroundColor: emailTokens.colors.surface,
    borderRadius: emailTokens.radius.lg,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  } satisfies CSSProperties,

  // Admin header uses a darker gradient.
  header: {
    background: emailTokens.colors.adminGradient,
    padding: "32px",
    borderRadius: `${emailTokens.radius.lg} ${emailTokens.radius.lg} 0 0`,
  } satisfies CSSProperties,

  headerTitle: {
    margin: "0",
    color: emailTokens.colors.surface,
    fontSize: "24px",
    fontWeight: "600",
    letterSpacing: "-0.5px",
  } satisfies CSSProperties,

  headerSubtitle: {
    margin: "8px 0 0",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "14px",
  } satisfies CSSProperties,

  // Admin content is plain padding (container already provides the surface).
  content: {
    padding: "32px",
  } satisfies CSSProperties,

  // Admin-only blocks
  quickAction: {
    backgroundColor: emailTokens.colors.surfaceMuted,
    padding: "24px 32px",
  } satisfies CSSProperties,

  sectionTitle: {
    margin: "32px 0 16px",
    color: emailTokens.colors.heading,
    fontSize: "18px",
    fontWeight: "600",
    borderBottom: `2px solid ${emailTokens.colors.border}`,
    paddingBottom: "8px",
  } satisfies CSSProperties,

  detailsTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "16px",
  } satisfies CSSProperties,

  labelCell: {
    padding: "8px 0",
    color: emailTokens.colors.textMuted,
    fontSize: "14px",
    fontWeight: "600",
    width: "40%",
    verticalAlign: "top",
  } satisfies CSSProperties,

  valueCell: {
    padding: "8px 0",
    color: emailTokens.colors.text,
    fontSize: "14px",
  } satisfies CSSProperties,

  metaCell: {
    padding: "8px 0",
    color: "#4a5568",
    fontSize: "12px",
    fontFamily: "monospace",
    wordBreak: "break-all",
  } satisfies CSSProperties,

  successCell: {
    padding: "8px 0",
    color: emailTokens.colors.success,
    fontSize: "14px",
    fontWeight: "600",
  } satisfies CSSProperties,

  errorCell: {
    padding: "8px 0",
    color: emailTokens.colors.danger,
    fontSize: "14px",
    fontWeight: "600",
  } satisfies CSSProperties,

  link: {
    color: emailTokens.colors.brand,
    textDecoration: "none",
  } satisfies CSSProperties,

  quoteCard: {
    backgroundColor: emailTokens.colors.surfaceMuted,
    border: `2px solid ${emailTokens.colors.border}`,
    borderLeft: `4px solid ${emailTokens.colors.brand}`,
    borderRadius: emailTokens.radius.md,
    padding: "20px",
    marginBottom: "16px",
  } satisfies CSSProperties,

  quote: {
    margin: "0",
    color: emailTokens.colors.text,
    fontSize: "15px",
    lineHeight: "1.7",
    fontStyle: "italic",
  } satisfies CSSProperties,

  button: {
    backgroundColor: emailTokens.colors.brand,
    color: emailTokens.colors.surface,
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: emailTokens.radius.sm,
    display: "inline-block",
  } satisfies CSSProperties,

  footer: {
    backgroundColor: emailTokens.colors.surfaceMuted,
    padding: "24px 32px",
    textAlign: "center",
    borderRadius: `0 0 ${emailTokens.radius.lg} ${emailTokens.radius.lg}`,
  } satisfies CSSProperties,

  footerText: {
    margin: "0 0 16px",
    color: "#4a5568",
    fontSize: "14px",
  } satisfies CSSProperties,
} as const

