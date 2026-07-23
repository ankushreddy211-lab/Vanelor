/**
 * Accessibility tokens. Per architecture doc §28 — these are not
 * aspirational, they're inputs to component code and to CI (axe-core, §23).
 */
export const a11y = {
  focusRing: {
    width: "1px",
    offset: "4px",
    style: "solid",
  },
  minTapTarget: "44px", // WCAG 2.5.5 / iOS HIG minimum
  contrastTarget: {
    bodyText: 4.5, // WCAG AA, normal text
    largeText: 3, // WCAG AA, 24px+/bold 19px+
    aaaBodyText: 7, // aspirational, checked in audit but not blocking
  },
  /**
   * Every component using `motion.ts` durations must fall back to this when
   * `prefers-reduced-motion: reduce` is set — near-zero, not "a bit
   * faster." See landing prototype's globals.css for the enforced version.
   */
  reducedMotionDurationMs: 0.01,
} as const;
