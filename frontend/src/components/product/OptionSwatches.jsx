export default function OptionSwatches({ option, selectedId, onSelect }) {
  return (
    <div>
      <p className="text-sm font-medium text-ink">{option.name}</p>
      <div className="mt-2 flex flex-wrap gap-2.5">
        {option.values.map((value) => {
          const active = value.id === selectedId;
          return (
            <button
              key={value.id}
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
    </div>
  );
}
