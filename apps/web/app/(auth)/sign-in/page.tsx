import { Text } from "@valenor/design-system";
import { SignInForm } from "./SignInForm";

interface SignIINRops {
  searchParams: {
    from?: string;
  };
}

/**
 * Valenor Luxury Brand Gate - Core Authentication Entry Point
 * Implements a production-grade redirect mechanism post-verification.
 */
export default function SignIn({ searchParams }: SignIINRops) {
  // Capture dynamic post-login redirect targets (defaults safely back to the collection root grid)
  const redirectTo = searchParams.from ?? "/";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center antialiased">
      <div className="flex w-full max-w-sm flex-col items-center animate-fade-in">
        
        {/* Sub-label identity framing */}
        <Text role="label" as="p" className="tracking-widest uppercase text-fg-muted text-xs">
          Sign In
        </Text>
        
        {/* Core architectural headliner */}
        <Text role="heading" as="h1" className="mt-4 font-serif text-3xl font-light tracking-tight text-fg">
          Enter the house
        </Text>
        
        {/* Interactive form container slot */}
        <div className="mt-10 w-full">
          <SignInForm redirectTo={redirectTo} />
        </div>
        
        {/* Onboarding routing matrix anchor */}
        <Text role="caption" as="p" className="mt-8 text-sm text-fg-subtle">
          New here?{" "}
          <a 
            href="/sign-up" 
            className="font-medium text-accent-strong transition-colors duration-200 hover:text-accent-hover hover:underline"
          >
            Create an account
          </a>
        </Text>
        
      </div>
    </main>
  );
}