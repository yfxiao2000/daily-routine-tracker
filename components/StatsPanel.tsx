import { DayTask } from "@/types/routine";
import { formatDate } from "@/utils/dateUtils";

interface StatsPanelProps {
  getTasksForDate: (dateStr: string) => DayTask[];
  streak: number;
}

export default function StatsPanel({ getTasksForDate, streak }: StatsPanelProps) {
  // 计算最近 7 天的完成数据
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return formatDate(d);
  });

  const stats = days.map((dateStr) => {
    const tasks = getTasksForDate(dateStr);
    const completed = tasks.filter((t) => t.completed).length;
    return {
      date: dateStr,
      total: tasks.length,
      completed,
      rate: tasks.length > 0 ? completed / tasks.length : 0,
    };
  });

  // 过去 7 天总计
  const totalTasks = stats.reduce((sum, s) => sum + s.total, 0);
  const totalCompleted = stats.reduce((sum, s) => sum + s.completed, 0);
  const avgRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div className="mb-6 p-4 bg-white border border-gray-border rounded-lg">
      {/* ---- 顶部数据 ---- */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">完成统计</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-400">平均完成率</div>
            <div className="text-lg font-bold text-primary">{avgRate}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">连续打卡</div>
            <div className="text-lg font-bold text-orange-500">
              {streak > 0 ? `${streak} 天` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* ---- 柱状图 ---- */}
      <div className="flex items-end gap-2 h-20">
        {stats.map((s) => {
          const dateObj = new Date(s.date + "T00:00:00");
          const isToday = s.date === formatDate(new Date());
          return (
            <div key={s.date} className="flex-1 flex flex-col items-center gap-1">
              {/* 完成数 */}
              <span className="text-[10px] text-gray-400">
                {s.total > 0 ? `${s.completed}/${s.total}` : ""}
              </span>
              {/* 柱子 */}
              <div className="w-full bg-gray-100 rounded-t relative h-12">
                {s.total > 0 && (
                  <div
                    className={`absolute bottom-0 w-full rounded-t transition-all ${
                      s.rate === 1 ? "bg-success" : "bg-primary"
                    }`}
                    style={{ height: `${Math.max(s.rate * 100, 4)}%` }}
                  />
                )}
              </div>
              {/* 日期标签 */}
              <span
                className={`text-[10px] ${
                  isToday ? "text-primary font-bold" : "text-gray-400"
                }`}
              >
                {weekdayLabels[dateObj.getDay()]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
