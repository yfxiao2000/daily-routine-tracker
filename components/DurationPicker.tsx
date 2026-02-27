export const DURATION_OPTIONS = [0.5, 1, 1.5, 2, 3];
export const DURATION_LABELS: Record<number, string> = {
  0.5: "30分钟",
  1: "1小时",
  1.5: "1.5小时",
  2: "2小时",
  3: "3小时",
};

interface DurationPickerProps {
  value: number;
  onChange: (duration: number) => void;
  variant?: "pills" | "select";
  label?: string;
}

export default function DurationPicker({
  value,
  onChange,
  variant = "pills",
  label,
}: DurationPickerProps) {
  if (variant === "select") {
    return (
      <div>
        {label && <div className="text-xs text-gray-500 mb-1.5">{label}</div>}
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="px-3 py-1.5 text-sm border border-gray-border rounded-lg
            focus:outline-none focus:border-primary bg-white"
        >
          {DURATION_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {DURATION_LABELS[d]}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      {label && <div className="text-xs text-gray-500 mb-1.5">{label}</div>}
      <div className="flex gap-1.5">
        {DURATION_OPTIONS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors
              ${value === d
                ? "bg-primary text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:border-primary"
              }`}
          >
            {DURATION_LABELS[d]}
          </button>
        ))}
      </div>
    </div>
  );
}
