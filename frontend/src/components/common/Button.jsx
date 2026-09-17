import { motion } from "framer-motion";

const VARIANTS = {
  primary: "bg-pine text-on-pine border border-pine hover:bg-pine-dark",
  secondary: "bg-paper text-ink border border-ink hover:bg-paper-dim",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-paper-dim",
};

const SIZES = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled = false,
  ...props
}) {
  return (
    <motion.div
      whileTap={disabled ? {} : { scale: 0.97 }}
      className="inline-block"
      style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
    >
      <Tag
        className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-150 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </Tag>
    </motion.div>
  );
}
