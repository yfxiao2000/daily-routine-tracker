import { ViewMode } from "@/types/routine";

interface CalendarHeaderProps {
  year: number;
  month: number;              // 0-11
  viewMode: ViewMode;
  onPrev: () => void;         // 点击 < 箭头
  onNext: () => void;         // 点击 > 箭头
  onToggleView: () => void;   // 切换月/周视图
  onToday: () => void;        // 回到今天
}

export default function CalendarHeader({
  year,
  month,
  viewMode,
  onPrev,
  onNext,
  onToggleView,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* ---- 左侧：导航箭头 + 月份标题 ---- */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full
            hover:bg-gray-100 text-gray-600 transition-colors"
        >
          &lt;
        </button>

        <h2 className="text-lg font-semibold text-gray-800 min-w-[120px] text-center">
          {year}年 {month + 1}月
        </h2>

        <button
          onClick={onNext}
          className="w-8 h-8 flex items-center justify-center rounded-full
            hover:bg-gray-100 text-gray-600 transition-colors"
        >
          &gt;
        </button>

        <button
          onClick={onToday}
          className="ml-2 px-3 py-1 text-xs text-primary border border-primary
            rounded-full hover:bg-blue-50 transition-colors"
        >
          今天
        </button>
      </div>

      {/* ---- 右侧：月/周视图切换 ---- */}
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        <button
          onClick={viewMode === "month" ? undefined : onToggleView}
          className={`px-3 py-1 text-sm rounded-md transition-colors
            ${viewMode === "month"
              ? "bg-white text-gray-800 shadow-sm font-medium"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          月
        </button>
        <button
          onClick={viewMode === "week" ? undefined : onToggleView}
          className={`px-3 py-1 text-sm rounded-md transition-colors
            ${viewMode === "week"
              ? "bg-white text-gray-800 shadow-sm font-medium"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          周
        </button>
      </div>
    </div>
  );
}
