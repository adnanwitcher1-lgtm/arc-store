import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Palette, Check, X } from "lucide-react";
import { useTheme, THEMES } from "../../context/ThemeContext";

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-60 rounded-2xl border border-ink/10 bg-paper p-3 shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-medium text-ink">Color scheme</p>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-stone hover:text-ink">
                <X size={15} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-paper-dim ${
                    theme === t.id ? "bg-paper-dim font-medium text-ink" : "text-ink-soft"
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 overflow-hidden rounded-full border border-ink/10">
                    <span className="h-full w-1/2" style={{ backgroundColor: t.swatch[0] }} />
                    <span className="h-full w-1/2" style={{ backgroundColor: t.swatch[1] }} />
                  </span>
                  {t.label}
                  {theme === t.id && <Check size={14} className="ml-auto text-pine" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Change color scheme"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-lg"
      >
        <Palette size={19} />
      </motion.button>
    </div>
  );
}
