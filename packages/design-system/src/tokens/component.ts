/**
 * Component tokens — sizing decisions that recur across multiple primitives.
 * Kept separate from spacing.ts because these are semantic ("a button is
 * this tall") rather than raw scale values, and often need to move together
 * (e.g. button height should always match input height in a form row).
 */
export const componentSize = {
  controlHeight: {
    sm: "36px",
    md: "44px", // default — matches accessibility.ts minTapTarget
    lg: "52px",
  },
  iconSize: {
    sm: "16px",
    md: "20px",
    lg: "24px",
  },
  borderWidth: {
    hairline: "1px",
    emphasis: "2px",
  },
} as const;
