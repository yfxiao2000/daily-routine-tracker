import { useState, useRef, useEffect } from "react";
import {
  DayTask,
  Category,
  CategoryConfig,
  DAY_LABELS,
  DayOfWeek,
  RoutineTemplate,
} from "@/types/routine";
import { formatDate, formatHour, formatTimeRange } from "@/utils/dateUtils";
import RoutineItem from "./RoutineItem";
import CategoryPicker from "./CategoryPicker";
import DayPicker from "./DayPicker";
import DurationPicker, { DURATION_LABELS } from "./DurationPicker";

interface DayTaskListProps {
  date: string;
  tasks: DayTask[];
  categories: Record<string, CategoryConfig>;
  onToggle: (task: DayTask) => void;
  onDelete: (task: DayTask) => void;
  onAddOneOff: (title: string, category: Category, date: string, hour: number, duration: number) => void;
  onEditOneOff: (sourceId: string, hour: number, duration: number) => void;
  onAddCategory: (key: string, config: CategoryConfig) => void;
  onAddTemplate: (template: Omit<RoutineTemplate, "id">) => void;
  onRemoveOneOffs: (tasks: { title: string; category: string; date: string; hour: number }[]) => void;
}

// 时间轴显示的小时范围
const TIMELINE_START = 6;
const TIMELINE_END = 23;
const HOURS = Array.from(
  { length: TIMELINE_END - TIMELINE_START + 1 },
  (_, i) => TIMELINE_START + i
);


// 向导步骤
type WizardStep = "list" | "input" | "pickTime" | "afterAdd" | "saveTemplate";

// 本次会话中添加的任务
interface SessionTask { title: string; category: Category; hour: number; duration: number; }

export default function DayTaskList({
  date,
  tasks,
  categories,
  onToggle,
  onDelete,
  onAddOneOff,
  onEditOneOff,
  onAddCategory,
  onAddTemplate,
  onRemoveOneOffs,
}: DayTaskListProps) {
  // ---- 向导步骤 ----
  const [step, setStep] = useState<WizardStep>("list");

  // ---- 新任务表单 ----
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("other");
  const [newDuration, setNewDuration] = useState(1);

  // ---- 本次编辑会话中添加的所有任务 ----
  const [sessionTasks, setSessionTasks] = useState<SessionTask[]>([]);

  // ---- 模板日期选择 ----
  const [templateDays, setTemplateDays] = useState<DayOfWeek[]>([]);

  // ---- 编辑任务时间 ----
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editHour, setEditHour] = useState(9);
  const [editDuration, setEditDuration] = useState(1);

  const inputRef = useRef<HTMLInputElement>(null);

  // ---- 格式化日期标题 ----
  const dateObj = new Date(date + "T00:00:00");
  const monthDay = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  const dayName = DAY_LABELS[dateObj.getDay() as DayOfWeek];

  const completedCount = tasks.filter((t) => t.completed).length;

  // ---- 最新添加的任务 ----
  const latestTask = sessionTasks[sessionTasks.length - 1];

  // ---- 进入输入步骤时自动聚焦 ----
  useEffect(() => {
    if (step === "input") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [step]);

  // ---- 开始添加任务 ----
  const handleStartAdd = () => {
    setNewTitle("");
    setNewCategory("other");
    setNewDuration(1);
    if (step === "list") setSessionTasks([]);
    setStep("input");
  };

  // ---- 确认任务信息 → 进入选时间 ----
  const handleNextToTimePicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setStep("pickTime");
  };

  // ---- 选择时间 → 保存任务 → 询问下一步 ----
  const handlePickTime = (hour: number) => {
    const title = newTitle.trim();
    onAddOneOff(title, newCategory, date, hour, newDuration);
    setSessionTasks((prev) => [...prev, { title, category: newCategory, hour, duration: newDuration }]);
    setStep("afterAdd");
  };

  // ---- 继续添加 ----
  const handleContinueAdd = () => {
    setNewTitle("");
    setNewCategory("other");
    setNewDuration(1);
    setStep("input");
  };

  // ---- 结束编辑 → 问是否保存模板 ----
  const handleFinishEditing = () => {
    setTemplateDays([]);
    setStep("saveTemplate");
  };

  // ---- 保存为模板 ----
  const handleSaveTemplate = () => {
    if (templateDays.length === 0) return;
    const dayOfWeek = new Date(date + "T00:00:00").getDay() as DayOfWeek;
    if (templateDays.includes(dayOfWeek)) {
      onRemoveOneOffs(
        sessionTasks.map((t) => ({ title: t.title, category: t.category, date, hour: t.hour }))
      );
    }
    for (const task of sessionTasks) {
      onAddTemplate({
        title: task.title,
        category: task.category,
        repeatDays: templateDays,
        hour: task.hour,
        duration: task.duration,
      });
    }
    setSessionTasks([]);
    setStep("list");
  };

  // ---- 不保存模板 ----
  const handleSkipTemplate = () => {
    setSessionTasks([]);
    setStep("list");
  };

  // ---- 取消当前步骤 ----
  const handleCancel = () => {
    setStep("list");
    setNewTitle("");
  };

  // ---- 切换模板日期 ----
  const toggleDay = (day: DayOfWeek) => {
    setTemplateDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // ---- 开始编辑任务时间 ----
  const startEditTime = (task: DayTask) => {
    setEditingTaskId(task.id);
    setEditHour(task.hour);
    setEditDuration(task.duration);
  };

  // ---- 保存编辑的时间 ----
  const saveEditTime = () => {
    if (!editingTaskId) return;
    const task = tasks.find((t) => t.id === editingTaskId);
    if (task && task.sourceType === "oneoff") {
      onEditOneOff(task.sourceId, editHour, editDuration);
    }
    setEditingTaskId(null);
  };

  return (
    <div>
      {/* ---- 日期标题 + 进度 ---- */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-lg">
          {monthDay} (周{dayName})
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            已完成 {completedCount} / {tasks.length}
          </span>
          {tasks.length > 0 && (
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ===== 步骤 1：任务列表 ===== */}
      {step === "list" && (
        <>
          <div className="flex flex-col gap-2 mb-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                还没有任务
              </p>
            ) : (
              tasks.map((task) => (
                <div key={task.id}>
                  <RoutineItem
                    task={task}
                    categories={categories}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    showTime
                    onEdit={task.sourceType === "oneoff" ? () => startEditTime(task) : undefined}
                  />
                  {/* 编辑时间面板 */}
                  {editingTaskId === task.id && (
                    <div className="ml-11 mt-1 p-2.5 bg-gray-50 rounded-lg border border-gray-100
                      flex flex-wrap gap-2 items-center">
                      <label className="text-xs text-gray-500">时间：</label>
                      <select
                        value={editHour}
                        onChange={(e) => setEditHour(Number(e.target.value))}
                        className="px-2 py-1 text-xs border border-gray-border rounded-md bg-white
                          focus:outline-none focus:border-primary"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{formatHour(i)}</option>
                        ))}
                      </select>
                      <DurationPicker value={editDuration} onChange={setEditDuration} variant="select" label="时长：" />
                      <button
                        onClick={saveEditTime}
                        className="px-2.5 py-1 text-xs bg-primary text-white rounded-md"
                      >
                        确定
                      </button>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleStartAdd}
            className="w-full py-2.5 text-sm text-primary border border-dashed
              border-primary rounded-lg hover:bg-blue-50 transition-colors"
          >
            + 添加任务
          </button>
        </>
      )}

      {/* ===== 步骤 2：填写任务信息 ===== */}
      {step === "input" && (
        <form onSubmit={handleNextToTimePicker} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">新建任务</div>

          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="任务名称..."
            className="px-3 py-2 text-sm border border-gray-border rounded-lg
              focus:outline-none focus:border-primary"
            onKeyDown={(e) => e.key === "Escape" && handleCancel()}
          />

          {/* 分类选择 */}
          <CategoryPicker
            categories={categories}
            selected={newCategory}
            onSelect={setNewCategory}
            onAddCategory={onAddCategory}
          />

          {/* 时长选择 */}
          <DurationPicker value={newDuration} onChange={setNewDuration} label="时长：" />

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg
                hover:bg-primary-hover transition-colors disabled:opacity-40"
            >
              下一步 — 选择时间
            </button>
          </div>
        </form>
      )}

      {/* ===== 步骤 3：选择时间段 ===== */}
      {step === "pickTime" && (
        <div>
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-primary font-medium">
                点击时间段放置任务
              </span>
              <span className="text-sm text-gray-600">
                「{newTitle}」
              </span>
              {categories[newCategory] && (
                <span className={`text-xs px-2 py-0.5 rounded-full
                  ${categories[newCategory].bg} ${categories[newCategory].color}`}>
                  {categories[newCategory].label}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {DURATION_LABELS[newDuration]}
              </span>
            </div>
            <button
              onClick={handleCancel}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              取消
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto border border-gray-100 rounded-lg">
            {HOURS.map((hour) => {
              const nowDate = new Date();
              const todayStr = formatDate(nowDate);
              const isCurrentHour = nowDate.getHours() === hour && date === todayStr;

              // 显示该时段已有的任务
              const tasksAtHour = tasks.filter((t) => t.hour === hour);

              return (
                <div
                  key={hour}
                  className={`flex border-b border-gray-50 min-h-[48px]
                    cursor-pointer hover:bg-blue-50/40
                    ${isCurrentHour ? "bg-blue-50/50" : ""}
                  `}
                  onClick={() => handlePickTime(hour)}
                >
                  <div className="w-16 flex-shrink-0 py-2 pr-2 text-right">
                    <span className={`text-xs ${isCurrentHour ? "text-primary font-bold" : "text-gray-400"}`}>
                      {formatHour(hour)}
                    </span>
                  </div>
                  <div className="flex-grow border-l border-gray-100 py-2 px-2">
                    {tasksAtHour.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {tasksAtHour.map((t) => {
                          const cat = categories[t.category] || { label: t.category, color: "text-gray-600", bg: "bg-gray-100" };
                          return (
                            <span key={t.id} className={`text-xs ${cat.color}`}>
                              {t.title}
                            </span>
                          );
                        })}
                        <span className="text-xs text-primary/50">点击追加</span>
                      </div>
                    ) : (
                      <span className="text-xs text-primary/50">点击放置</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 步骤 4：添加成功 ===== */}
      {step === "afterAdd" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-xl">✓</span>
          </div>
          <div className="text-sm text-gray-700">
            已添加「{latestTask?.title}」到 {formatTimeRange(latestTask?.hour ?? 9, latestTask?.duration ?? 1)}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleContinueAdd}
              className="px-5 py-2 text-sm text-primary border border-primary
                rounded-lg hover:bg-blue-50 transition-colors"
            >
              继续添加
            </button>
            <button
              onClick={handleFinishEditing}
              className="px-5 py-2 text-sm bg-primary text-white rounded-lg
                hover:bg-primary-hover transition-colors"
            >
              结束编辑
            </button>
          </div>
        </div>
      )}

      {/* ===== 步骤 5：是否保存为模板 ===== */}
      {step === "saveTemplate" && (
        <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 text-center">
            要把本次添加的 {sessionTasks.length} 个任务保存为重复模板吗？
          </div>

          <div className="flex flex-col gap-1.5">
            {sessionTasks.map((task, i) => {
              const cat = categories[task.category] || { label: task.category, color: "text-gray-600", bg: "bg-gray-100" };
              return (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 text-sm">
                  <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                    {formatTimeRange(task.hour, task.duration)}
                  </span>
                  <span className="flex-grow text-gray-700">{task.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${cat.bg} ${cat.color}`}>
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-gray-500 text-center">
            保存后每周选中的日子会自动出现这些任务
          </div>

          <DayPicker
            selected={templateDays}
            onToggle={toggleDay}
            onSetDays={setTemplateDays}
          />

          <div className="flex gap-2 justify-center">
            <button
              onClick={handleSkipTemplate}
              className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              不需要
            </button>
            <button
              onClick={handleSaveTemplate}
              disabled={templateDays.length === 0}
              className="px-5 py-2 text-sm bg-primary text-white rounded-lg
                hover:bg-primary-hover transition-colors disabled:opacity-40"
            >
              保存模板
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
