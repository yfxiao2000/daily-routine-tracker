import { DAY_LABELS, DayOfWeek, DayTask } from "@/types/routine";
import { getMonthGridDates, formatDate, isToday } from "@/utils/dateUtils";

interface MonthViewProps {
  year: number;
  month: number;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  getTasksForDate: (dateStr: string) => DayTask[];
}

export default function MonthView({
  year,
  month,
  selectedDate,
  onSelectDate,
  getTasksForDate,
}: MonthViewProps) {
  const gridDates = getMonthGridDates(year, month);

  return (
    <div className="mb-6">
      {/* ---- 星期几表头 ---- */}
      <div className="grid grid-cols-7 mb-1">
        {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
          <div
            key={day}
            className={`text-center text-xs font-medium py-2
              ${day === 0 || day === 6 ? "text-gray-400" : "text-gray-500"}`}
          >
            {DAY_LABELS[day]}
          </div>
        ))}
      </div>

      {/* ---- 日期网格：6 行 × 7 列 ---- */}
      <div className="grid grid-cols-7">
        {gridDates.map((date, index) => {
          const dateStr = formatDate(date);
          const isCurrentMonth = date.getMonth() === month;
          const isSelected = dateStr === selectedDate;
          const isTodayDate = isToday(date);
          const tasks = getTasksForDate(dateStr);
          const completedCount = tasks.filter((t) => t.completed).length;

          return (
            <button
              key={index}
              onClick={() => onSelectDate(dateStr)}
              className={`relative p-1 min-h-[52px] border-t border-gray-100
                flex flex-col items-center transition-colors
                ${isCurrentMonth ? "" : "opacity-30"}
                ${isSelected ? "bg-selected" : "hover:bg-gray-50"}
              `}
            >
              {/* 日期数字 */}
              <span
                className={`text-sm w-7 h-7 flex items-center justify-center rounded-full
                  ${isTodayDate ? "bg-primary text-white font-bold" : ""}
                  ${isSelected && !isTodayDate ? "font-semibold text-primary" : ""}
                `}
              >
                {date.getDate()}
              </span>

              {/* 任务指示点（最多显示 4 个） */}
              {tasks.length > 0 && isCurrentMonth && (
                <div className="flex gap-0.5 mt-0.5">
                  {tasks.slice(0, 4).map((task, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        task.completed ? "bg-success" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
