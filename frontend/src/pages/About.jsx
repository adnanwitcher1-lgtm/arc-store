import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gem, Truck, ShieldCheck, Headset } from "lucide-react";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import PageFade from "../components/common/PageTransition";
import { useCategories } from "../lib/useCategories";
import { SITE } from "../lib/site";

const VALUES = [
  { icon: Gem, title: "Chosen with care", text: "Every product is picked for how it holds up over time, not just how it looks in a photo." },
  { icon: Truck, title: "Fast delivery", text: "We deliver across Pakistan, and orders over Rs 5,000 ship free." },
  { icon: ShieldCheck, title: "Buy with confidence", text: "A 30-day money-back guarantee on every order, no awkward questions." },
  { icon: Headset, title: "Real support", text: "Message us on WhatsApp or email and a real person will get back to you." },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function About() {
  const { categories } = useCategories();

  return (
    <PageFade>
      <section className="border-b border-ink/10 bg-paper-dim/50">
        <Container className="py-14 sm:py-20">
          <p className="text-sm font-medium uppercase tracking-widest text-pine">About us</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Everyday essentials, made to last.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft">
            {SITE.name} is a Faisalabad-based online store for watches, footwear, skincare, grooming, fashion and
            lifestyle goods. We started with a simple idea: shopping online should feel trustworthy — clear prices,
            honest descriptions, and products that match what you see on screen.
          </p>
        </Container>
      </section>

      <Container className="py-14">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={reveal}>
          <h2 className="text-2xl font-semibold text-ink">Why shop with us</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-ink/10 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pine/10 text-pine">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>

      {categories.length > 0 && (
        <Container className="pb-14">
          <h2 className="text-2xl font-semibold text-ink">What we sell</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-pine hover:text-pine"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </Container>
      )}

      <Container className="pb-10">
        <div className="rounded-3xl bg-band px-6 py-12 text-center text-band-fg sm:px-12">
          <h2 className="text-2xl font-semibold">Have a question? We'd love to hear from you.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-band-fg/70">
            Ask about a product, an order or anything else — we usually reply the same day.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/contact" variant="primary" size="lg">
              Contact us
            </Button>
            <Button as={Link} to="/shop" variant="secondary" size="lg">
              Start shopping
            </Button>
          </div>
        </div>
      </Container>
    </PageFade>
  );
}
