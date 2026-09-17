import { Truck, ShieldCheck, Headset } from "lucide-react";
import Container from "../common/Container";

const ITEMS = [
  { icon: Truck, label: "Free delivery on orders over Rs 5,000" },
  { icon: ShieldCheck, label: "30-day money-back guarantee" },
  { icon: Headset, label: "24/7 customer support" },
];

export default function TopBar() {
  return (
    <div className="bg-band text-band-fg">
      <Container className="flex h-10 items-center justify-center gap-8 overflow-hidden text-xs sm:justify-between">
        {ITEMS.map(({ icon: Icon, label }, i) => (
          <div
            key={label}
            className={`items-center gap-1.5 whitespace-nowrap ${i === 0 ? "flex" : "hidden sm:flex"}`}
          >
            <Icon size={14} strokeWidth={2} />
            <span>{label}</span>
          </div>
        ))}
      </Container>
    </div>
  );
}
