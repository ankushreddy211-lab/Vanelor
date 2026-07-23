import { cn } from "../lib/cn";

export function Divider({ className, orientation = "horizontal" }: { className?: string; orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === "horizontal" ? "h-px w-full bg-border" : "h-full w-px bg-border",
        className
      )}
    />
  );
}
