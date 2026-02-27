import { DAY_LABELS, DayOfWeek, DayTask, CategoryConfig } from "@/types/routine";
import { getWeekDates, formatDate, isToday } from "@/utils/dateUtils";

interface WeekViewProps {
  weekStartDate: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  getTasksForDate: (dateStr: string) => DayTask[];
  onToggle: (task: DayTask) => void;
  categories: Record<string, CategoryConfig>;
}

export default function WeekView({
  weekStartDate,
  selectedDate,
  onSelectDate,
  getTasksForDate,
  onToggle,
  categories,
}: WeekViewProps) {
  const weekDates = getWeekDates(weekStartDate);

  return (
    <div className="grid grid-cols-7 gap-1 mb-6">
      {weekDates.map((date) => {
        const dateStr = formatDate(date);
        const dayOfWeek = date.getDay() as DayOfWeek;
        const isTodayDate = isToday(date);
        const isSelected = dateStr === selectedDate;
        const tasks = getTasksForDate(dateStr);

        return (
          <div
            key={dateStr}
            className={`rounded-lg border min-h-[200px] flex flex-col
              ${isSelected ? "border-primary bg-selected" : "border-gray-100 bg-white"}
            `}
          >
            {/* ---- 列头：星期 + 日期 ---- */}
            <button
              onClick={() => onSelectDate(dateStr)}
              className="p-2 text-center border-b border-gray-100 hover:bg-gray-50"
            >
              <div className="text-xs text-gray-400">
                {DAY_LABELS[dayOfWeek]}
              </div>
              <div
                className={`text-sm mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full
                  ${isTodayDate ? "bg-primary text-white font-bold" : "text-gray-700"}
                `}
              >
                {date.getDate()}
              </div>
            </button>

            {/* ---- 当天任务列表 ---- */}
            <div className="flex-grow p-1 flex flex-col gap-1 overflow-y-auto">
              {tasks.map((task) => {
                const cat = categories[task.category] || { label: task.category, color: "text-gray-600", bg: "bg-gray-100" };
                return (
                  <button
                    key={task.id}
                    onClick={() => onToggle(task)}
                    className={`text-left text-xs p-1.5 rounded transition-colors
                      ${task.completed
                        ? "line-through text-gray-400 bg-gray-50"
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <span className="text-gray-400 font-mono mr-1">
                      {String(task.hour).padStart(2, "0")}
                    </span>
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${cat.bg} border ${
                        task.completed ? "border-gray-300" : "border-current"
                      }`}
                      style={{ borderColor: task.completed ? undefined : "currentColor" }}
                    />
                    {task.title}
                  </button>
                );
              })}
              {tasks.length === 0 && (
                <div className="text-xs text-gray-300 text-center mt-4">无任务</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
