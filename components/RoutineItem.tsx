import { DayTask, CategoryConfig } from "@/types/routine";
import { formatTimeRange } from "@/utils/dateUtils";

interface RoutineItemProps {
  task: DayTask;
  categories: Record<string, CategoryConfig>;
  onToggle: (task: DayTask) => void;
  onDelete?: (task: DayTask) => void;
  showTime?: boolean;
  onEdit?: () => void; // 编辑时间（仅单日任务）
}

export default function RoutineItem({
  task,
  categories,
  onToggle,
  onDelete,
  showTime = false,
  onEdit,
}: RoutineItemProps) {
  const cat = categories[task.category] || { label: task.category, color: "text-gray-600", bg: "bg-gray-100" };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-border">
      {/* ---- 时间标签（可选） ---- */}
      {showTime && (
        <button
          onClick={onEdit}
          disabled={!onEdit}
          className={`text-xs font-mono flex-shrink-0
            ${onEdit
              ? "text-primary hover:underline cursor-pointer"
              : "text-gray-400 cursor-default"
            }`}
          title={onEdit ? "点击修改时间" : "模板任务请在模板管理中编辑"}
        >
          {formatTimeRange(task.hour, task.duration)}
        </button>
      )}

      {/* ---- 勾选按钮 ---- */}
      <button
        onClick={() => onToggle(task)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
          ${task.completed
            ? "bg-success border-success text-white"
            : "border-gray-300 hover:border-primary"
          }`}
      >
        {task.completed && <span className="text-sm">✓</span>}
      </button>

      {/* ---- 任务标题 ---- */}
      <span
        className={`flex-grow ${
          task.completed ? "line-through text-gray-400" : "text-gray-800"
        }`}
      >
        {task.title}
      </span>

      {/* ---- 来源标记 ---- */}
      {task.sourceType === "template" && (
        <span className="text-[10px] text-gray-400 flex-shrink-0">重复</span>
      )}

      {/* ---- 分类标签 ---- */}
      <span
        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0
          ${cat.bg} ${cat.color}`}
      >
        {cat.label}
      </span>

      {/* ---- 删除按钮 ---- */}
      {onDelete && task.sourceType === "oneoff" && (
        <button
          onClick={() => onDelete(task)}
          className="text-gray-400 hover:text-danger flex-shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
}
