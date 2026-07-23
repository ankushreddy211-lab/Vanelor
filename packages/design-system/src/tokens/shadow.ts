/**
 * Shadow tokens. Quiet luxury reads as flat, not floating — shadows exist
 * only where elevation communicates real state (a popover is above the
 * page), never as decoration. Deliberately no colored/glow shadows.
 */
export const shadow = {
  none: "none",
  sm: "0 1px 2px rgba(10, 10, 8, 0.4)",
  md: "0 8px 24px rgba(10, 10, 8, 0.45)",
} as const;

/**
 * Usage guidance (enforced by design review, not by types):
 * - `sm`: pressed/active states on raised surfaces only.
 * - `md`: popovers, dropdowns, modals — anything genuinely floating above content.
 * - Product imagery and editorial panels never take a shadow; their edge is
 *   the `border` semantic color token, not elevation.
 */
