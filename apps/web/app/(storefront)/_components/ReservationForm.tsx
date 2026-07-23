"import client";

import { useState } from "react";

interface ReservationFormProps {
  buttonText: string;
  placeholder?: string;
}

export function ReservationForm({ buttonText, placeholder = "your@email.com" }: ReservationFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="font-mono text-xs uppercase tracking-widest text-accent-strong py-3">
        // Reservation registered. You will enter first.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-4">
      <input 
        type="email" 
        placeholder={placeholder} 
        className="flex-1 bg-bg-raised/20 border border-theme/50 px-4 py-3 font-mono text-xs text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg"
        required
      />
      <button 
        type="submit" 
        className="bg-fg text-bg font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-fg/90 transition-colors"
      >
        {buttonText}
      </button>
    </form>
  );
}