"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Text, Input, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@valenor/design-system";
// Update this path to match where your createBrowserClient instance is stored
import { supabaseClient } from "../../../lib/auth/auth-client";

interface SignInFormProps {
  redirectTo: string;
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  return (
    <Tabs defaultValue="password" className="w-full max-w-sm">
      <TabsList>
        <TabsTrigger value="password">Email</TabsTrigger>
        <TabsTrigger value="otp">Email Code</TabsTrigger>
      </TabsList>

      <TabsContent value="password">
        <PasswordForm redirectTo={redirectTo} />
      </TabsContent>
      <TabsContent value="otp">
        <OTPForm redirectTo={redirectTo} />
      </TabsContent>
    </Tabs>
  );
}

/* ============================================================================
   1. EMAIL / PASSWORD SIGN IN ENGINE
   ============================================================================ */
function PasswordForm({ redirectTo }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    setPending(false);

    if (signInError) {
      setError(signInError.message ?? "Authentication failed.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 text-left">
      <Input
        type="email"
        placeholder="Email Address *"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />
      <Input
        type="password"
        placeholder="Password *"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            checked={rememberDevice}
            onChange={(event) => setRememberDevice(event.target.checked)}
            className="h-4 w-4 rounded border-border text-fg accent-fg"
          />
          <label htmlFor="remember" className="text-xs text-fg-muted cursor-pointer select-none">
            Remember this device
          </label>
        </div>

        <a
          href="/forgot-password"
          className="text-xs text-fg-subtle hover:text-fg transition-colors underline"
        >
          Forgot Password?
        </a>
      </div>

      {error && <Text role="caption" as="p" className="text-accent-strong text-xs font-medium">{error}</Text>}
      
      <Button type="submit" variant="primary" className="w-full mt-2" disabled={pending}>
        {pending ? "Verifying..." : "Sign In"}
      </Button>
    </form>
  );
}

/* ============================================================================
   2. ONE-TIME PASSWORD (OTP) STREAM
   ============================================================================ */
function OTPForm({ redirectTo }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSendCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const { error: sendError } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        // Technically not needed for 6-digit OTP, but good fallback for the link
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    setPending(false);

    if (sendError) {
      setError(sendError.message ?? "Couldn't send the code.");
      return;
    }
    setSent(true);
  }

  async function handleVerifyCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const { error: verifyError } = await supabaseClient.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    setPending(false);

    if (verifyError) {
      setError(verifyError.message ?? "Invalid or expired code.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  if (sent) {
    return (
      <form onSubmit={handleVerifyCode} className="mt-6 flex flex-col gap-4 text-left">
        <Text role="bodySm" as="p" className="text-xs text-fg-muted mb-2">
          We sent a 6-digit code to <span className="text-fg font-medium">{email}</span>.
        </Text>
        <Input
          type="text"
          placeholder="6-Digit Code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoComplete="one-time-code"
          maxLength={6}
          required
        />
        {error && <Text role="caption" as="p" className="text-accent-strong text-xs font-medium">{error}</Text>}
        <Button type="submit" variant="primary" className="w-full mt-2" disabled={pending || code.length !== 6}>
          {pending ? "Verifying..." : "Verify & Sign In"}
        </Button>
        <button
          type="button"
          onClick={() => { setSent(false); setCode(""); setError(null); }}
          className="text-xs text-fg-subtle hover:text-fg transition-colors underline mt-2 text-center"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="mt-6 flex flex-col gap-4 text-left">
      <Input
        type="email"
        placeholder="Email Address *"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />
      {error && <Text role="caption" as="p" className="text-accent-strong text-xs font-medium">{error}</Text>}
      <Button type="submit" variant="primary" className="w-full mt-2" disabled={pending}>
        {pending ? "Sending Code..." : "Send Login Code"}
      </Button>
    </form>
  );
}