/**
 * Typography tokens.
 *
 * Two families only, per the frontend-design brief: a characterful display
 * face used with restraint (Fraunces — variable optical size lets large
 * hero type and small editorial numerals share one family honestly), and a
 * quiet utility face for everything that needs to be read quickly (Inter).
 */

export const fontFamily = {
  display: "'Fraunces', serif",
  body: "'Inter', sans-serif",
} as const;

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  // Fraunces-specific: its variable axis reads better at non-round weights
  // for display sizes — 340 and 440 are deliberate, not typos.
  displayLight: 340,
  displayRegular: 440,
} as const;

interface TypeStep {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
  fontFamily: string;
  fontWeight: number;
}

export const type = {
  displayLg: {
    fontSize: "6rem",
    lineHeight: "1",
    letterSpacing: "-0.01em",
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.displayLight,
  },
  display: {
    fontSize: "4.5rem",
    lineHeight: "1.05",
    letterSpacing: "-0.01em",
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.displayLight,
  },
  displaySm: {
    fontSize: "3rem",
    lineHeight: "1.1",
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.displayRegular,
  },
  headingLg: {
    fontSize: "2.5rem",
    lineHeight: "1.15",
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.displayRegular,
  },
  heading: {
    fontSize: "2rem",
    lineHeight: "1.2",
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.displayRegular,
  },
  headingSm: {
    fontSize: "1.5rem",
    lineHeight: "1.3",
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.displayRegular,
  },
  bodyLg: {
    fontSize: "1.125rem",
    lineHeight: "1.6",
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.light,
  },
  body: {
    fontSize: "1rem",
    lineHeight: "1.6",
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.light,
  },
  bodySm: {
    fontSize: "0.875rem",
    lineHeight: "1.55",
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.regular,
  },
  caption: {
    fontSize: "0.8125rem",
    lineHeight: "1.4",
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.regular,
  },
  label: {
    fontSize: "0.6875rem",
    lineHeight: "1.4",
    letterSpacing: "0.22em",
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
  },
} satisfies Record<string, TypeStep>;
