import { motion } from "framer-motion";

const PHONE = "923714905398"; // 03431740756 in international format
const MESSAGE = "Hi! I have a question about a product.";

export default function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"
      whileTap={{ scale: 0.94 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.4 }}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-40" />
      <svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.353.615 4.56 1.69 6.475L2.667 29.333l7.05-1.848a13.27 13.27 0 0 0 6.287 1.6h.006c7.362 0 13.333-5.97 13.333-13.334 0-3.56-1.387-6.907-3.905-9.425A13.246 13.246 0 0 0 16.004 2.667Zm0 24.4h-.005a11.05 11.05 0 0 1-5.632-1.542l-.404-.24-4.184 1.097 1.117-4.078-.263-.418a11.04 11.04 0 0 1-1.692-5.886c0-6.106 4.967-11.073 11.068-11.073 2.957 0 5.736 1.152 7.827 3.245a10.996 10.996 0 0 1 3.24 7.833c0 6.106-4.966 11.062-11.072 11.062Zm6.07-8.287c-.332-.166-1.966-.97-2.27-1.081-.305-.111-.527-.166-.749.167-.222.332-.86 1.08-1.055 1.303-.194.222-.388.25-.72.083-.332-.167-1.4-.516-2.667-1.646-.986-.879-1.652-1.965-1.846-2.297-.194-.332-.021-.512.146-.678.15-.149.332-.389.498-.583.166-.194.222-.333.333-.555.111-.222.056-.417-.028-.583-.083-.167-.748-1.804-1.026-2.472-.27-.65-.545-.562-.748-.572l-.638-.011c-.222 0-.583.083-.888.417-.305.332-1.166 1.14-1.166 2.777 0 1.638 1.194 3.22 1.36 3.443.166.222 2.35 3.587 5.693 5.032.795.343 1.415.548 1.898.702.797.253 1.523.217 2.097.132.64-.095 1.966-.804 2.244-1.581.277-.777.277-1.443.194-1.581-.083-.14-.305-.222-.638-.389Z" />
      </svg>
    </motion.a>
  );
}
