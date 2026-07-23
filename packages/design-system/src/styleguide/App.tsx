import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../lib/ThemeProvider";
import { semanticColor } from "../tokens/color";
import { type as typeScale } from "../tokens/typography";
import { space } from "../tokens/spacing";
import { duration, easing } from "../tokens/motion";
import { shadow } from "../tokens/shadow";
import { radius } from "../tokens/radius";
import { Button, Input, Text, Divider, Eyebrow, Card, Tabs, TabsList, TabsTrigger, TabsContent } from "../primitives";

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="border-b border-border py-16">
      <div className="mb-10 max-w-2xl">
        <Text role="label" as="p" className="mb-3">
          {title}
        </Text>
        {description && (
          <Text role="body" as="p" className="text-fg-muted">
            {description}
          </Text>
        )}
      </div>
      {children}
    </section>
  );
}

function ColorSwatch({ name, hex, on }: { name: string; hex: string; on: string }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="h-16 w-16 shrink-0 rounded-sm border border-border"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <div>
        <Text role="bodySm" as="p" className="text-fg">
          {name}
        </Text>
        <Text role="caption" as="p">
          {hex} on {on}
        </Text>
      </div>
    </div>
  );
}

function ColorSection() {
  const { theme } = useTheme();
  const colors = semanticColor[theme];
  return (
    <Section
      title="Color"
      description="Semantic tokens only — components never reference raw hex. Toggle theme (top right) to see dark/light swap live."
    >
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
        <ColorSwatch name="bg" hex={colors.bg} on="—" />
        <ColorSwatch name="bgRaised" hex={colors.bgRaised} on="bg" />
        <ColorSwatch name="fg" hex={colors.fg} on="bg" />
        <ColorSwatch name="fgMuted" hex={colors.fgMuted} on="bg" />
        <ColorSwatch name="fgSubtle" hex={colors.fgSubtle} on="bg" />
        <ColorSwatch name="accent" hex={colors.accent} on="bg" />
        <ColorSwatch name="accentStrong" hex={colors.accentStrong} on="bg" />
      </div>
      <Text role="caption" as="p" className="mt-8">
        Full computed contrast ratios: see CONTRAST_AUDIT.md
      </Text>
    </Section>
  );
}

function TypographySection() {
  const roles = Object.keys(typeScale) as Array<keyof typeof typeScale>;
  return (
    <Section title="Typography" description="Named by role, not size. Fraunces for display, Inter for body/labels.">
      <div className="space-y-8">
        {roles.map((role) => (
          <div key={role} className="flex flex-col gap-2 border-b border-border/50 pb-6 sm:flex-row sm:items-baseline sm:gap-8">
            <Text role="caption" as="span" className="w-32 shrink-0 text-fg-subtle">
              {role} · {typeScale[role]!.fontSize}
            </Text>
            <Text role={role} as="p" className="text-fg">
              The mountains keep time
            </Text>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SpacingSection() {
  const keys: Array<keyof typeof space> = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64];
  return (
    <Section title="Spacing" description="4px base unit. Runs generous at the top end for editorial section rhythm.">
      <div className="space-y-3">
        {keys.map((key) => (
          <div key={key} className="flex items-center gap-4">
            <Text role="caption" as="span" className="w-16 shrink-0">
              {key} · {space[key]}
            </Text>
            <div className="h-3 bg-accent" style={{ width: space[key] }} />
          </div>
        ))}
      </div>
    </Section>
  );
}

// "cubic-bezier(0.22, 1, 0.36, 1)" -> [0.22, 1, 0.36, 1]
function parseCubicBezier(css: string): [number, number, number, number] {
  const nums = css.match(/-?\d*\.?\d+/g)?.map(Number) ?? [0.4, 0, 0.2, 1];
  return [nums[0] ?? 0.4, nums[1] ?? 0, nums[2] ?? 0.2, nums[3] ?? 1];
}

function MotionSection() {
  const [key, setKey] = useState(0);
  const durations = Object.entries(duration);
  const entranceEase = parseCubicBezier(easing.entrance);
  return (
    <Section title="Motion" description="Few durations, few easings, named recipes. Click to replay.">
      <button
        onClick={() => setKey((k) => k + 1)}
        className="label mb-8 border border-border px-4 py-2 hover:border-accent-strong hover:text-accent-strong"
      >
        Replay
      </button>
      <div className="space-y-6">
        {durations.map(([name, ms]) => (
          <div key={name} className="flex items-center gap-6">
            <Text role="caption" as="span" className="w-24 shrink-0">
              {name} · {ms}ms
            </Text>
            <div className="h-8 w-64 border border-border">
              <motion.div
                key={`${name}-${key}`}
                className="h-full w-8 bg-accent-strong"
                initial={{ x: 0 }}
                animate={{ x: 224 }}
                transition={{ duration: ms / 1000, ease: entranceEase }}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ShadowRadiusSection() {
  return (
    <Section title="Shadow & Radius" description="Shadows used sparingly — elevation communicates real state only. Sharp edges by default.">
      <div className="mb-10 flex flex-wrap gap-8">
        {Object.entries(shadow).map(([name, value]) => (
          <div key={name} className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 bg-bg-raised" style={{ boxShadow: value }} />
            <Text role="caption" as="span">
              {name}
            </Text>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-8">
        {Object.entries(radius).map(([name, value]) => (
          <div key={name} className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 border border-accent-strong" style={{ borderRadius: value }} />
            <Text role="caption" as="span">
              {name} · {value}
            </Text>
          </div>
        ))}
      </div>
    </Section>
  );
}

function PrimitivesSection() {
  return (
    <Section title="Primitives" description="Built on Radix UI where interaction complexity warrants it (Tabs). Every control meets the 44px tap target.">
      <div className="space-y-14">
        <div>
          <Text role="caption" as="p" className="mb-4">
            Button
          </Text>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Reserve</Button>
            <Button variant="secondary">Learn more</Button>
            <Button variant="ghost">Dismiss</Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </div>

        <div>
          <Text role="caption" as="p" className="mb-4">
            Input
          </Text>
          <Input placeholder="your@email.com" className="max-w-sm" />
        </div>

        <div>
          <Text role="caption" as="p" className="mb-4">
            Eyebrow
          </Text>
          <Eyebrow numeral="I">Origin</Eyebrow>
        </div>

        <div>
          <Text role="caption" as="p" className="mb-4">
            Divider
          </Text>
          <Divider />
        </div>

        <div>
          <Text role="caption" as="p" className="mb-4">
            Card
          </Text>
          <Card className="max-w-sm">
            <Text role="headingSm" as="h3">
              Chapter Four
            </Text>
            <Text role="bodySm" as="p" className="mt-2 text-fg-muted">
              Opens soon.
            </Text>
          </Card>
        </div>

        <div>
          <Text role="caption" as="p" className="mb-4">
            Tabs (Radix)
          </Text>
          <Tabs defaultValue="material" className="max-w-md">
            <TabsList>
              <TabsTrigger value="material">Material</TabsTrigger>
              <TabsTrigger value="form">Form</TabsTrigger>
              <TabsTrigger value="care">Care</TabsTrigger>
            </TabsList>
            <TabsContent value="material">
              <Text role="bodySm" as="p" className="text-fg-muted">
                Undyed wool, hand-finished cotton.
              </Text>
            </TabsContent>
            <TabsContent value="form">
              <Text role="bodySm" as="p" className="text-fg-muted">
                Tailored silhouette, no logo.
              </Text>
            </TabsContent>
            <TabsContent value="care">
              <Text role="bodySm" as="p" className="text-fg-muted">
                Dry clean only.
              </Text>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Section>
  );
}

export function StyleGuide() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:px-12">
      <header className="mb-16 flex items-center justify-between">
        <div>
          <Text role="display" as="h1" className="text-4xl md:text-5xl">
            Design System
          </Text>
          <Text role="body" as="p" className="mt-2 text-fg-muted">
            VALENOR — Phase 2. Every token, every primitive.
          </Text>
        </div>
        <button
          onClick={toggleTheme}
          className="label border border-border px-4 py-2 hover:border-accent-strong hover:text-accent-strong"
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </header>

      <ColorSection />
      <TypographySection />
      <SpacingSection />
      <MotionSection />
      <ShadowRadiusSection />
      <PrimitivesSection />
    </div>
  );
}
