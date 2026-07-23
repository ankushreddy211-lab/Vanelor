import { createElement, forwardRef, type ElementType, type HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type TextRole =
  | "displayLg"
  | "display"
  | "displaySm"
  | "headingLg"
  | "heading"
  | "headingSm"
  | "bodyLg"
  | "body"
  | "bodySm"
  | "caption"
  | "label";

const roleClasses: Record<TextRole, string> = {
  displayLg: "font-display font-normal text-[6rem] leading-none tracking-tight",
  display: "font-display font-normal text-[4.5rem] leading-[1.05] tracking-tight",
  displaySm: "font-display font-normal text-5xl leading-[1.1]",
  headingLg: "font-display font-normal text-4xl leading-[1.15]",
  heading: "font-display font-normal text-3xl leading-[1.2]",
  headingSm: "font-display font-normal text-2xl leading-[1.3]",
  bodyLg: "font-body font-light text-lg leading-relaxed",
  body: "font-body font-light text-base leading-relaxed",
  bodySm: "font-body font-normal text-sm leading-relaxed",
  caption: "font-body font-normal text-[13px] leading-snug text-fg-muted",
  label: "font-body font-medium text-[11px] uppercase tracking-label text-fg-muted",
};

// Sensible default element per role, so callers rarely need to pass `as`.
const roleDefaultElement: Record<TextRole, ElementType> = {
  displayLg: "h1",
  display: "h1",
  displaySm: "h1",
  headingLg: "h2",
  heading: "h2",
  headingSm: "h3",
  bodyLg: "p",
  body: "p",
  bodySm: "p",
  caption: "span",
  label: "span",
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  role: TextRole;
  as?: ElementType;
}

export const Text = forwardRef<HTMLElement, TextProps>(({ role, as, className, ...props }, ref) => {
  const Component = as ?? roleDefaultElement[role];
  return createElement(Component, {
    ref,
    className: cn(roleClasses[role], className),
    ...props,
  });
});
Text.displayName = "Text";
