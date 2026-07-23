import { Text } from "./Text";

export function Eyebrow({ numeral, children }: { numeral?: string; children: string }) {
  return (
    <div className="flex items-baseline gap-4">
      {numeral && (
        <span className="font-display text-sm text-accent-strong" aria-hidden>
          {numeral}
        </span>
      )}
      <Text role="label" as="span">
        {children}
      </Text>
    </div>
  );
}
