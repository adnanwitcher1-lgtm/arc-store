import { isColorOption, resolveColor, needsBorder } from "../../lib/colors";

function ColorOption({ option, selectedId, onSelect }) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-2.5">
      {option.values.map((value) => {
        const active = value.id === selectedId;
        const hex = resolveColor(value);

        // Unknown colour name and no hex saved -> show as a readable text chip instead of a blank dot.
        if (!hex) {
          return (
            <button
              key={value.id}
              type="button"
              onClick={() => onSelect(value.id)}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                active ? "border-pine bg-pine text-on-pine" : "border-ink/20 text-ink hover:border-ink"
              }`}
            >
              {value.label}
            </button>
          );
        }

        return (
          <button
            key={value.id}
            type="button"
            onClick={() => onSelect(value.id)}
            title={value.label}
            aria-label={value.label}
            aria-pressed={active}
            className={`h-10 w-10 rounded-full border-2 p-0.5 transition-all ${
              active ? "border-pine ring-2 ring-pine/20" : "border-transparent hover:border-ink/30"
            }`}
          >
            <span
              className={`block h-full w-full rounded-full ${needsBorder(hex) ? "border border-ink/25" : ""}`}
              style={{ backgroundColor: hex }}
            />
          </button>
        );
      })}
    </div>
  );
}

function ChipOption({ option, selectedId, onSelect }) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-2.5">
      {option.values.map((value) => {
        const active = value.id === selectedId;
        return (
          <button
            key={value.id}
            type="button"
            onClick={() => onSelect(value.id)}
            aria-pressed={active}
            className={`min-w-[3rem] rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "border-pine bg-pine text-on-pine"
                : "border-ink/20 bg-paper text-ink hover:border-ink"
            }`}
          >
            {value.label}
          </button>
        );
      })}
    </div>
  );
}

export default function OptionSwatches({ option, selectedId, onSelect, error = false }) {
  const asColor = isColorOption(option);
  const selectedLabel = option.values.find((v) => v.id === selectedId)?.label;

  return (
    <div>
      <p className="text-sm font-medium text-ink">
        {option.name}
        {selectedLabel && <span className="ml-1.5 font-normal text-stone">— {selectedLabel}</span>}
      </p>
      {asColor ? (
        <ColorOption option={option} selectedId={selectedId} onSelect={onSelect} />
      ) : (
        <ChipOption option={option} selectedId={selectedId} onSelect={onSelect} />
      )}
      {error && <p className="mt-2 text-sm text-brick">Please select a {option.name.toLowerCase()}.</p>}
    </div>
  );
}
