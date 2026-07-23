import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-none border-0 border-b border-border bg-transparent px-0 font-body text-sm text-fg placeholder:text-fg-subtle transition-colors duration-200 ease-seam focus-visible:border-accent-strong focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
