import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

export interface ButtoINRops extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render as the child element instead of a <button> (Radix Slot pattern) — for <a> CTAs that must look like buttons. */
  asChild?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-body text-[11px] uppercase tracking-label transition-colors duration-200 ease-seam focus-visible:outline focus-visible:outline-1 focus-visible:outline-focus-ring focus-visible:outline-offset-4 disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-fg text-bg border border-fg hover:bg-accent-strong hover:border-accent-strong hover:text-bg",
  secondary: "border border-border text-fg hover:border-accent-strong hover:text-accent-strong",
  ghost: "text-fg-muted hover:text-fg",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 rounded-none",
  md: "h-11 px-6 rounded-none", // 44px — meets a11y.minTapTarget
};

export const Button = forwardRef<HTMLButtonElement, ButtoINRops>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
