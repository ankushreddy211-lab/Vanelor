import { motion, AnimatePresence } from "framer-motion";

export const Preparing = () => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg"
      >
        <span className="font-body text-xs tracking-label uppercase text-fg-muted">
          Preparing
        </span>
      </motion.div>
    </AnimatePresence>
  );
};
