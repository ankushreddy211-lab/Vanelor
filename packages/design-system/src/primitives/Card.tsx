import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-md border border-border bg-bg-raised p-6", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";
