import { useState } from "react";
import { RoutineTemplate, CategoryConfig, DAY_LABELS, DayOfWeek } from "@/types/routine";
import { formatTimeRange } from "@/utils/dateUtils";
import TemplateForm from "./TemplateForm";

interface TemplateManagerProps {
  templates: RoutineTemplate[];
  categories: Record<string, CategoryConfig>;
  onAdd: (template: Omit<RoutineTemplate, "id">) => void;
  onEdit: (id: string, data: Omit<RoutineTemplate, "id">) => void;
  onDelete: (id: string) => void;
  onAddCategory: (key: string, config: CategoryConfig) => void;
}

export default function TemplateManager({
  templates,
  categories,
  onAdd,
  onEdit,
  onDelete,
  onAddCategory,
}: TemplateManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="border border-gray-border rounded-lg overflow-hidden">
      {/* ---- 折叠头部 ---- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white
          hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">
          管理重复模板
          <span className="text-gray-400 ml-2 font-normal">
            ({templates.length} 个)
          </span>
        </span>
        <span className="text-gray-400 text-sm">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* ---- 展开内容 ---- */}
      {isOpen && (
        <div className="border-t border-gray-border p-3 flex flex-col gap-3">
          {templates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">
              还没有模板，点击下方按钮创建
            </p>
          ) : (
            templates.map((tpl) => {
              const cat = categories[tpl.category] || { label: tpl.category, color: "text-gray-600", bg: "bg-gray-100" };

              // 正在编辑这个模板
              if (editingId === tpl.id) {
                return (
                  <TemplateForm
                    key={tpl.id}
                    categories={categories}
                    initialData={{
                      title: tpl.title,
                      category: tpl.category,
                      repeatDays: tpl.repeatDays,
                      hour: tpl.hour,
                      duration: tpl.duration ?? 1,
                    }}
                    onSave={(data) => {
                      onEdit(tpl.id, data);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                    onAddCategory={onAddCategory}
                  />
                );
              }

              return (
                <div
                  key={tpl.id}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100"
                >
                  {/* 时间范围 */}
                  <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                    {formatTimeRange(tpl.hour, tpl.duration ?? 1)}
                  </span>

                  {/* 标题 */}
                  <span className="flex-grow text-sm text-gray-800">{tpl.title}</span>

                  {/* 重复日标记 */}
                  <div className="flex gap-0.5 flex-shrink-0">
                    {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
                      <span
                        key={day}
                        className={`w-5 h-5 text-[10px] rounded-full flex items-center justify-center
                          ${tpl.repeatDays.includes(day)
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-300"
                          }`}
                      >
                        {DAY_LABELS[day]}
                      </span>
                    ))}
                  </div>

                  {/* 分类 */}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0
                      ${cat.bg} ${cat.color}`}
                  >
                    {cat.label}
                  </span>

                  {/* 编辑 */}
                  <button
                    onClick={() => setEditingId(tpl.id)}
                    className="text-gray-400 hover:text-primary flex-shrink-0 text-sm"
                    title="编辑模板"
                  >
                    ✎
                  </button>

                  {/* 删除 */}
                  <button
                    onClick={() => onDelete(tpl.id)}
                    className="text-gray-400 hover:text-danger flex-shrink-0 text-sm"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}

          {/* 新建模板表单 / 按钮 */}
          {showForm ? (
            <TemplateForm
              categories={categories}
              onSave={(data) => {
                onAdd(data);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
              onAddCategory={onAddCategory}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-2 text-sm text-primary border border-dashed
                border-primary rounded-lg hover:bg-blue-50 transition-colors"
            >
              + 新建模板
            </button>
          )}
        </div>
      )}
    </div>
  );
}
