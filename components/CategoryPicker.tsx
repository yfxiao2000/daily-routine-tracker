import { useState } from "react";
import { Category, CategoryConfig, COLOR_PRESETS } from "@/types/routine";

interface CategoryPickerProps {
  categories: Record<string, CategoryConfig>;
  selected: Category;
  onSelect: (key: Category) => void;
  onAddCategory: (key: string, config: CategoryConfig) => void;
}

export default function CategoryPicker({
  categories,
  selected,
  onSelect,
  onAddCategory,
}: CategoryPickerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [colorIdx, setColorIdx] = useState(0);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const key = `custom_${Date.now()}`;
    onAddCategory(key, {
      label: trimmed,
      ...COLOR_PRESETS[colorIdx],
    });
    onSelect(key);
    setNewName("");
    setShowAddForm(false);
  };

  return (
    <>
      {/* ---- 分类按钮列表 ---- */}
      <div className="flex gap-1.5 flex-wrap items-center">
        {Object.entries(categories).map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`px-2.5 py-0.5 text-xs rounded-full transition-colors
              ${selected === key
                ? `${config.bg} ${config.color} font-medium`
                : "bg-white text-gray-400 hover:bg-gray-100"
              }`}
          >
            {config.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-6 h-6 text-xs rounded-full bg-white text-gray-400 border border-dashed
            border-gray-300 hover:border-primary hover:text-primary transition-colors
            flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* ---- 添加分类表单 ---- */}
      {showAddForm && (
        <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-100">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="分类名称"
            className="px-2 py-1 text-xs border border-gray-border rounded-md w-20
              focus:outline-none focus:border-primary"
          />
          <div className="flex gap-1">
            {COLOR_PRESETS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setColorIdx(i)}
                className={`w-5 h-5 rounded-full ${preset.bg} border-2 transition-colors
                  ${colorIdx === i ? "border-gray-800" : "border-transparent"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="px-2 py-1 text-xs bg-primary text-white rounded-md"
          >
            添加
          </button>
        </div>
      )}
    </>
  );
}
