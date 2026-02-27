import { useState, useEffect } from "react";
import {
  Category,
  CategoryConfig,
  COLOR_PRESETS,
  DayOfWeek,
  DAY_LABELS,
  RoutineTemplate,
} from "@/types/routine";
import { formatHour } from "@/utils/dateUtils";

interface TemplateFormProps {
  categories: Record<string, CategoryConfig>;
  onSave: (template: Omit<RoutineTemplate, "id">) => void;
  onCancel: () => void;
  onAddCategory: (key: string, config: CategoryConfig) => void;
  initialData?: Omit<RoutineTemplate, "id">; // 编辑模式：预填数据
}

// 时长选项
const DURATION_OPTIONS = [0.5, 1, 1.5, 2, 3];
const DURATION_LABELS: Record<number, string> = {
  0.5: "30分钟", 1: "1小时", 1.5: "1.5小时", 2: "2小时", 3: "3小时",
};

export default function TemplateForm({ categories, onSave, onCancel, onAddCategory, initialData }: TemplateFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState<Category>(initialData?.category ?? "other");
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>(initialData?.repeatDays ?? []);
  const [hour, setHour] = useState(initialData?.hour ?? 9);
  const [duration, setDuration] = useState(initialData?.duration ?? 1);

  // 添加分类小表单状态
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColorIdx, setNewCatColorIdx] = useState(0);

  const isEditMode = !!initialData;

  // 当 initialData 变化时更新表单
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setRepeatDays(initialData.repeatDays);
      setHour(initialData.hour);
      setDuration(initialData.duration ?? 1);
    }
  }, [initialData]);

  const toggleDay = (day: DayOfWeek) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const selectWeekdays = () => setRepeatDays([1, 2, 3, 4, 5]);
  const selectEveryday = () => setRepeatDays([0, 1, 2, 3, 4, 5, 6]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || repeatDays.length === 0) return;
    onSave({ title: trimmed, category, repeatDays, hour, duration });
    if (!isEditMode) {
      setTitle("");
      setRepeatDays([]);
      setHour(9);
      setDuration(1);
    }
  };

  const handleAddCat = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    const key = `custom_${Date.now()}`;
    onAddCategory(key, {
      label: trimmed,
      ...COLOR_PRESETS[newCatColorIdx],
    });
    setCategory(key);
    setNewCatName("");
    setShowAddCat(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 flex flex-col gap-3">
      {/* ---- 标题输入 ---- */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="模板任务名称..."
        className="px-3 py-2 text-sm border border-gray-border rounded-lg
          focus:outline-none focus:border-primary"
      />

      {/* ---- 分类选择 ---- */}
      <div className="flex gap-1.5 flex-wrap items-center">
        {Object.entries(categories).map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`px-2.5 py-0.5 text-xs rounded-full transition-colors
              ${category === key
                ? `${config.bg} ${config.color} font-medium`
                : "bg-white text-gray-400 hover:bg-gray-100"
              }`}
          >
            {config.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowAddCat(!showAddCat)}
          className="w-6 h-6 text-xs rounded-full bg-white text-gray-400 border border-dashed
            border-gray-300 hover:border-primary hover:text-primary transition-colors
            flex items-center justify-center"
        >
          +
        </button>
      </div>

      {showAddCat && (
        <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-100">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="分类名称"
            className="px-2 py-1 text-xs border border-gray-border rounded-md w-20
              focus:outline-none focus:border-primary"
          />
          <div className="flex gap-1">
            {COLOR_PRESETS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setNewCatColorIdx(i)}
                className={`w-5 h-5 rounded-full ${preset.bg} border-2 transition-colors
                  ${newCatColorIdx === i ? "border-gray-800" : "border-transparent"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddCat}
            className="px-2 py-1 text-xs bg-primary text-white rounded-md"
          >
            添加
          </button>
        </div>
      )}

      {/* ---- 星期选择器 ---- */}
      <div>
        <div className="text-xs text-gray-500 mb-1.5">重复日：</div>
        <div className="flex gap-1.5 items-center">
          {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`w-8 h-8 text-xs rounded-full transition-colors
                ${repeatDays.includes(day)
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
            onClick={selectWeekdays}
            className="text-xs text-primary hover:underline"
          >
            工作日
          </button>
          <button
            type="button"
            onClick={selectEveryday}
            className="text-xs text-primary hover:underline"
          >
            每天
          </button>
        </div>
      </div>

      {/* ---- 时间 + 时长 ---- */}
      <div className="flex gap-4">
        <div>
          <div className="text-xs text-gray-500 mb-1.5">执行时间：</div>
          <select
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-border rounded-lg
              focus:outline-none focus:border-primary bg-white"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {formatHour(i)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1.5">时长：</div>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
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
      </div>

      {/* ---- 操作按钮 ---- */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!title.trim() || repeatDays.length === 0}
          className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg
            hover:bg-primary-hover transition-colors disabled:opacity-40"
        >
          {isEditMode ? "更新模板" : "保存模板"}
        </button>
      </div>
    </form>
  );
}
