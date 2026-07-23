"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useReducedMotion, Input, Button } from "@valenor/design-system";
import { createReservation } from "../../actions/reservation";

export function Waitlist() {
  const reducedMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{ success: boolean; message: string }>({
    success: false,
    message: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const response = await createReservation(null, formData);
        setState(response);
      } catch (error) {
        setState({
          success: false,
          message: "An unexpected error occurred during transmission.",
        });
      }
    });
  };

  return (
    <section id="waitlist" className="flex flex-col items-center justify-center px-6 py-32 text-center scroll-mt-20 bg-bg text-fg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <h2 className="mb-4 font-display text-4xl text-fg uppercase tracking-wide">The Registry</h2>
        <p className="mb-12 font-body text-sm leading-relaxed text-fg-muted uppercase tracking-wider">
          Invitation follows your first reservation.
        </p>
        
        {state.success ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-border bg-bg-raised px-6 py-8 text-center"
          >
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-fg block mb-2">
              Registration Complete
            </span>
            <p className="font-mono text-[11px] uppercase tracking-wider text-fg-muted">
              {state.message}
            </p>
          </motion.div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Input 
                name="email"
                type="email" 
                placeholder="Email address" 
                required
                disabled={isPending}
                className="text-center placeholder:text-center font-mono text-xs uppercase tracking-widest bg-transparent border-border"
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full font-mono text-xs uppercase tracking-[0.2em] py-4"
              disabled={isPending}
            >
              {isPending ? "Transmitting..." : "Request Access"}
            </Button>

            {state.message && !state.success && (
              <p className="font-mono text-[10px] uppercase tracking-wider text-red-500 mt-2">
                {state.message}
              </p>
            )}
          </form>
        )}
      </motion.div>
    </section>
  );
}