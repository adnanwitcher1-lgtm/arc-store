export default function Field({ label, value, onChange, type = "text", required = false, textarea = false }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <Tag
        type={textarea ? undefined : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={textarea ? 3 : undefined}
        className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 text-sm focus:border-pine"
      />
    </label>
  );
}
