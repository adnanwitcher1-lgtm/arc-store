import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({ images, productName }) {
  const [active, setActive] = useState(0);
  const hasImages = images && images.length > 0;

  function go(delta) {
    if (!hasImages) return;
    setActive((current) => (current + delta + images.length) % images.length);
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {hasImages && images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                i === active ? "border-pine" : "border-transparent"
              }`}
              aria-label={`Show image ${i + 1}`}
            >
              <img src={img.image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl bg-paper-dim">
        <AnimatePresence mode="wait">
          {hasImages ? (
            <motion.img
              key={images[active].id}
              src={images[active].image}
              alt={images[active].alt_text || productName}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone">No image available</div>
          )}
        </AnimatePresence>

        {hasImages && images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow hover:bg-paper"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow hover:bg-paper"
            >
              <ChevronRight size={19} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
