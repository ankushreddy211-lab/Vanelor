"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Text, Input, Button } from "@valenor/design-system";
import { supabaseClient } from "../../../lib/auth/auth-client"; 

export function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Tracks confirmation state
  const [code, setCode] = useState("");
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setError("You must agree to the Terms & Privacy.");
      return;
    }

    setPending(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Register using Supabase auth client
    const { error: signUpError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    setPending(false);

    if (signUpError) {
      setError(signUpError.message ?? "Couldn't create the account.");
      return;
    }

    // Trigger the confirmation view state
    setIsSubmitted(true);
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

    // Success! 
    router.push("/dashboard");
    router.refresh();
  }

  // If successfully registered, show the OTP verification screen
  if (isSubmitted) {
    return (
      <form onSubmit={handleVerifyCode} className="mt-6 flex flex-col items-center text-center animate-fade-in w-full max-w-md mx-auto px-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-strong block mb-2">
          Protocol Verification
        </span>
        <Text role="heading" as="h2" className="text-2xl font-light uppercase tracking-tight text-fg">
          Verify your email
        </Text>
        <p className="mt-3 mb-6 text-xs sm:text-sm text-fg-muted font-sans leading-relaxed">
          We have sent a 6-digit code to <span className="font-medium text-fg">{email}</span>. Please enter it below to secure your account.
        </p>

        <div className="w-full flex flex-col gap-4 text-left">
          <Input
            type="text"
            placeholder="6-Digit Code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="one-time-code"
            maxLength={6}
            required
            className="text-center tracking-widest font-mono text-lg"
          />
          {error && (
            <Text role="caption" as="p" className="text-amber-500 text-xs font-mono bg-amber-500/10 border border-amber-500/20 p-2.5 text-left">
              {error}
            </Text>
          )}
          <Button type="submit" variant="primary" className="w-full mt-2 cursor-pointer font-mono text-xs uppercase tracking-[0.2em]" disabled={pending || code.length !== 6}>
            {pending ? "Verifying..." : "Verify Code →"}
          </Button>
          <button
            type="button"
            onClick={() => { setIsSubmitted(false); setCode(""); setError(null); }}
            className="text-xs text-fg-subtle hover:text-fg transition-colors underline mt-2 text-center"
          >
            Go Back
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md flex-col gap-4 text-left mx-auto px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-1 w-full">
          <Input
            type="text"
            placeholder="First Name *"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            required
          />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <Input
            type="text"
            placeholder="Last Name *"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Input
          type="email"
          placeholder="Email Address *"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <Input
          type="password"
          placeholder="Password *"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <Input
          type="password"
          placeholder="Confirm Password *"
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(event) => setTermsAccepted(event.target.checked)}
          className="h-4 w-4 rounded-none border-theme bg-bg text-fg accent-fg cursor-pointer"
          required
        />
        <label htmlFor="terms" className="text-xs text-fg-muted cursor-pointer select-none font-mono tracking-wide">
          I agree to the Terms &amp; Privacy
        </label>
      </div>

      {error && (
        <Text role="caption" as="p" className="text-amber-500 text-xs font-mono bg-amber-500/10 border border-amber-500/20 p-2.5">
          {error}
        </Text>
      )}

      <Button type="submit" variant="primary" className="w-full mt-2 cursor-pointer font-mono text-xs uppercase tracking-[0.2em]" disabled={pending}>
        {pending ? "Creating Account..." : "Create Account →"}
      </Button>
    </form>
  );
}