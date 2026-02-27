import { DayOfWeek, DAY_LABELS } from "@/types/routine";

interface DayPickerProps {
  selected: DayOfWeek[];
  onToggle: (day: DayOfWeek) => void;
  onSetDays: (days: DayOfWeek[]) => void;
  label?: string;
}

export default function DayPicker({
  selected,
  onToggle,
  onSetDays,
  label,
}: DayPickerProps) {
  return (
    <div>
      {label && <div className="text-xs text-gray-500 mb-1.5">{label}</div>}
      <div className="flex gap-1.5 items-center flex-wrap">
        {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => onToggle(day)}
            className={`w-8 h-8 text-xs rounded-full transition-colors
              ${selected.includes(day)
                ? "bg-primary text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:border-primary"
              }`}
          >
            {DAY_LABELS[day]}
          </button>
        ))}
        <span className="text-gray-300 mx-1">|</span>
        <button
          type="button"
          onClick={() => onSetDays([1, 2, 3, 4, 5])}
          className="text-xs text-primary hover:underline"
        >
          工作日
        </button>
        <button
          type="button"
          onClick={() => onSetDays([0, 1, 2, 3, 4, 5, 6])}
          className="text-xs text-primary hover:underline"
        >
          每天
        </button>
      </div>
    </div>
  );
}
