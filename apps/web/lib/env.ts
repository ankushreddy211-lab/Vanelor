import { z } from "zod";

/**
 * Every environment variable the app touches is declared here and
 * validated once, at import time. A missing/malformed var throws
 * immediately with a clear message — "fail loudly at startup rather than
 * fail confusingly at runtime on a missing var" (architecture §21).
 *
 * Import `env` everywhere instead of reading `process.env` directly, so
 * there's exactly one place that knows what variables exist.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 characters"),

  // Optional. Powers server-side atmosphere/texture photography (fabric,
  // tailoring tools, material studies) via the Unsplash API — real,
  // licensed photography for surfaces that don't have a VALENOR product
  // shoot yet. When absent, those surfaces fall back to the generative
  // motif system (@valenor/design-system/motifs) instead of failing.
  UNSPLASH_ACCESS_KEY: z.string().optional(),

  // Optional. Host serving real VALENOR product photography once a
  // shoot exists (e.g. an S3/Cloudfront or Cloudinary domain). Required
  // in next.config.mjs's image remotePatterns before piece.images[].url
  // can point there — validated here so a bad/missing value fails at
  // boot, not as a silent broken-image icon in production.
  PRODUCT_IMAGE_CDN_HOST: z.string().optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration. Check .env.local against .env.example:\n${issues}`
    );
  }
  return parsed.data;
}

export const env = loadEnv();
