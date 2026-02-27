import { useState, useEffect } from "react";
import {
  Category,
  CategoryConfig,
  DayOfWeek,
  RoutineTemplate,
} from "@/types/routine";
import { formatHour } from "@/utils/dateUtils";
import CategoryPicker from "./CategoryPicker";
import DayPicker from "./DayPicker";
import DurationPicker from "./DurationPicker";

interface TemplateFormProps {
  categories: Record<string, CategoryConfig>;
  onSave: (template: Omit<RoutineTemplate, "id">) => void;
  onCancel: () => void;
  onAddCategory: (key: string, config: CategoryConfig) => void;
  initialData?: Omit<RoutineTemplate, "id">; // 编辑模式：预填数据
}

export default function TemplateForm({ categories, onSave, onCancel, onAddCategory, initialData }: TemplateFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState<Category>(initialData?.category ?? "other");
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>(initialData?.repeatDays ?? []);
  const [hour, setHour] = useState(initialData?.hour ?? 9);
  const [duration, setDuration] = useState(initialData?.duration ?? 1);

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
      <CategoryPicker
        categories={categories}
        selected={category}
        onSelect={setCategory}
        onAddCategory={onAddCategory}
      />

      {/* ---- 星期选择器 ---- */}
      <DayPicker
        selected={repeatDays}
        onToggle={toggleDay}
        onSetDays={setRepeatDays}
        label="重复日："
      />

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
        <DurationPicker value={duration} onChange={setDuration} variant="select" label="时长：" />
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
