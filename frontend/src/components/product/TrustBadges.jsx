import { Truck, RotateCcw, CreditCard, Headset } from "lucide-react";

const BADGES = [
  { icon: Truck, title: "Free shipping", subtitle: "On orders over Rs 5,000" },
  { icon: RotateCcw, title: "30-day returns", subtitle: "Money-back guarantee" },
  { icon: CreditCard, title: "Secure payment", subtitle: "100% protected checkout" },
  { icon: Headset, title: "24/7 support", subtitle: "Dedicated help, any time" },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-6 border-y border-ink/10 py-6 sm:grid-cols-4">
      {BADGES.map(({ icon: Icon, title, subtitle }) => (
        <div key={title} className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-dim text-pine">
            <Icon size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">{title}</p>
            <p className="text-xs text-stone">{subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
