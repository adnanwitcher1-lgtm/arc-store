const isColorOption = (option) => {
  const name = (option.name || "").toLowerCase();
  if (name.includes("color") || name.includes("colour")) return true;
  // fallback: if every value actually has a hex_color, treat as color
  return option.values.length > 0 && option.values.every((v) => v.hex_color);
};

function ColorSwatches({ option, selectedId, onSelect }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2.5">
      {option.values.map((value) => {
        const active = value.id === selectedId;
        return (
          <button
            key={value.id}
            type="button"
            onClick={() => onSelect(value.id)}
            title={value.label}
            aria-label={value.label}
            aria-pressed={active}
            className={`h-9 w-9 rounded-full border-2 transition-shadow ${
              active ? "border-pine ring-2 ring-pine/15" : "border-transparent"
            }`}
          >
            <span
              className="block h-full w-full rounded-full border border-ink/10"
              style={{ backgroundColor: value.hex_color || "#EAE6DC" }}
            />
          </button>
        );
      })}
    </div>
  );
}

function SizeDropdown({ option, selectedId, onSelect }) {
  return (
    <select
      value={selectedId || ""}
      onChange={(e) => onSelect(Number(e.target.value))}
      aria-label={option.name}
      className="mt-2 w-full max-w-[220px] rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/15"
    >
      {option.values.map((value) => (
        <option key={value.id} value={value.id}>
          {value.label}
        </option>
      ))}
    </select>
  );
}

export default function OptionSwatches({ option, selectedId, onSelect }) {
  const asColor = isColorOption(option);
  return (
    <div>
      <p className="text-sm font-medium text-ink">{option.name}</p>
      {asColor ? (
        <ColorSwatches option={option} selectedId={selectedId} onSelect={onSelect} />
      ) : (
        <SizeDropdown option={option} selectedId={selectedId} onSelect={onSelect} />
      )}
    </div>
  );
}
