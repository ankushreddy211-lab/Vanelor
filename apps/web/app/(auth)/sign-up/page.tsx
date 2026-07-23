import { Text } from "@valenor/design-system";
import { SignUpForm } from "./SignUpForm";

/**
 * Valenor Brand Onboarding Gate - Core Registration Entry Point
 * Implements clean semantic structural alignment for premium brand positioning.
 */
export default function SignUp() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center antialiased">
      <div className="flex w-full max-w-sm flex-col items-center animate-fade-in">
        
        {/* Onboarding step indicator */}
        <Text role="label" as="p" className="tracking-widest uppercase text-fg-muted text-xs">
          Sign Up
        </Text>
        
        {/* Main luxury brand callout */}
        <Text role="heading" as="h1" className="mt-4 font-serif text-3xl font-light tracking-tight text-fg">
          Join VALENOR
        </Text>
        
        {/* Interactive registration form component slot */}
        <div className="mt-10 w-full">
          <SignUpForm />
        </div>
        
        {/* Returning member routing matrix anchor */}
        <Text role="caption" as="p" className="mt-8 text-sm text-fg-subtle">
          Already have an account?{" "}
          <a 
            href="/sign-in" 
            className="font-medium text-accent-strong transition-colors duration-200 hover:text-accent-hover hover:underline"
          >
            Sign in
          </a>
        </Text>
        
      </div>
    </main>
  );
}