"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  RoutineTemplate,
  OneOffTask,
  CompletionRecord,
  DayTask,
  Category,
  CategoryConfig,
  DEFAULT_CATEGORIES,
  ViewMode,
  DayOfWeek,
} from "@/types/routine";
import {
  formatDate,
  getWeekDates,
  getPrevMonth,
  getNextMonth,
  getPrevWeek,
  getNextWeek,
  makeCompletionKey,
} from "@/utils/dateUtils";
import * as api from "@/lib/api";
import CalendarHeader from "@/components/CalendarHeader";
import MonthView from "@/components/MonthView";
import WeekView from "@/components/WeekView";
import DayModal from "@/components/DayModal";
import TemplateManager from "@/components/TemplateManager";
import StatsPanel from "@/components/StatsPanel";
import Confetti from "@/components/Confetti";

export default function Home() {
  // ========== State ==========

  // 数据（4 组，现在从数据库加载而不是 localStorage）
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [oneoffs, setOneoffs] = useState<OneOffTask[]>([]);
  const [completions, setCompletions] = useState<CompletionRecord>({});
  const [customCategories, setCustomCategories] = useState<Record<string, CategoryConfig>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // 合并后的分类（默认 + 自定义）
  const categories: Record<string, CategoryConfig> = {
    ...DEFAULT_CATEGORIES,
    ...customCategories,
  };

  // 日历导航
  const now = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState(formatDate(now));
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [weekStart, setWeekStart] = useState(() => getWeekDates(now)[0]);

  // 弹窗状态：null = 关闭，"YYYY-MM-DD" = 打开并显示该天
  const [modalDate, setModalDate] = useState<string | null>(null);

  // 庆祝动画
  const [showConfetti, setShowConfetti] = useState(false);
  const prevAllCompleted = useRef(false);

  // ========== 从数据库加载数据 ==========

  useEffect(() => {
    async function loadData() {
      try {
        const [t, o, c, cat] = await Promise.all([
          api.fetchTemplates(),
          api.fetchOneoffs(),
          api.fetchCompletions(),
          api.fetchCategories(),
        ]);
        setTemplates(t);
        setOneoffs(o);
        setCompletions(c);
        setCustomCategories(cat);
      } catch (err) {
        console.error("加载数据失败:", err);
      }
      setIsLoaded(true);
    }
    loadData();
  }, []);

  // ========== 核心函数：计算某天的任务列表 ==========

  const getTasksForDate = useCallback(
    (dateStr: string): DayTask[] => {
      const dateObj = new Date(dateStr + "T00:00:00");
      const dayOfWeek = dateObj.getDay() as DayOfWeek;

      // 1. 模板任务
      const templateTasks: DayTask[] = templates
        .filter((tpl) => tpl.repeatDays.includes(dayOfWeek))
        .map((tpl) => ({
          id: `template:${tpl.id}`,
          sourceType: "template" as const,
          sourceId: tpl.id,
          title: tpl.title,
          category: tpl.category,
          completed: !!completions[makeCompletionKey(dateStr, "template", tpl.id)],
          date: dateStr,
          hour: tpl.hour ?? 9,
          duration: tpl.duration ?? 1,
        }));

      // 2. 单日任务
      const oneoffTasks: DayTask[] = oneoffs
        .filter((task) => task.date === dateStr)
        .map((task) => ({
          id: `oneoff:${task.id}`,
          sourceType: "oneoff" as const,
          sourceId: task.id,
          title: task.title,
          category: task.category,
          completed: !!completions[makeCompletionKey(dateStr, "oneoff", task.id)],
          date: dateStr,
          hour: task.hour ?? 9,
          duration: task.duration ?? 1,
        }));

      return [...templateTasks, ...oneoffTasks].sort((a, b) => a.hour - b.hour);
    },
    [templates, oneoffs, completions]
  );

  // ========== Handler 函数（现在调用 API） ==========

  const handleToggle = async (task: DayTask) => {
    // 乐观更新：先更新 UI，再发请求
    const key = makeCompletionKey(task.date, task.sourceType, task.sourceId);
    setCompletions((prev) => ({ ...prev, [key]: !prev[key] }));
    // 后台持久化
    await api.toggleCompletion(task.date, task.sourceType, task.sourceId);
  };

  const handleAddOneOff = async (title: string, category: Category, date: string, hour: number, duration: number) => {
    const created = await api.createOneoff({ title, category, date, hour, duration });
    setOneoffs((prev) => [...prev, created]);
  };

  const handleDeleteOneOff = async (task: DayTask) => {
    await api.deleteOneoff(task.sourceId);
    setOneoffs((prev) => prev.filter((t) => t.id !== task.sourceId));
    const key = makeCompletionKey(task.date, "oneoff", task.sourceId);
    setCompletions((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleEditOneOff = async (sourceId: string, hour: number, duration: number) => {
    const updated = await api.updateOneoff(sourceId, { hour, duration });
    setOneoffs((prev) => prev.map((t) => (t.id === sourceId ? updated : t)));
  };

  const handleAddTemplate = async (data: Omit<RoutineTemplate, "id">) => {
    const created = await api.createTemplate(data);
    setTemplates((prev) => [...prev, created]);
  };

  const handleEditTemplate = async (id: string, data: Omit<RoutineTemplate, "id">) => {
    const updated = await api.updateTemplate(id, data);
    setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  // 保存为模板后，删除当天对应的一日任务（避免重复）
  const handleRemoveOneOffs = async (
    tasksToRemove: { title: string; category: string; date: string; hour: number }[]
  ) => {
    const idsToRemove: string[] = [];
    const remaining = [...oneoffs];
    for (const toRemove of tasksToRemove) {
      const idx = remaining.findIndex(
        (t) =>
          t.title === toRemove.title &&
          t.category === toRemove.category &&
          t.date === toRemove.date &&
          t.hour === toRemove.hour
      );
      if (idx !== -1) {
        idsToRemove.push(remaining[idx].id);
        remaining.splice(idx, 1);
      }
    }
    // 从服务器删除
    for (const id of idsToRemove) {
      await api.deleteOneoff(id);
    }
    setOneoffs(remaining);
  };

  const handleDeleteTemplate = async (id: string) => {
    await api.deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddCategory = async (key: string, config: CategoryConfig) => {
    await api.createCategory(key, config);
    setCustomCategories((prev) => ({ ...prev, [key]: config }));
  };

  // ========== 连续打卡 ==========

  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dateStr = formatDate(d);
      const tasks = getTasksForDate(dateStr);
      if (tasks.length === 0) {
        if (i === 0) continue; // 今天还没有任务，跳过
        break;
      }
      if (tasks.every((t) => t.completed)) {
        count++;
      } else {
        if (i === 0) continue; // 今天还没结束，不算断
        break;
      }
    }
    return count;
  }, [getTasksForDate]);

  // ========== 庆祝动画触发 ==========

  useEffect(() => {
    if (!isLoaded) return;
    const todayTasks = getTasksForDate(formatDate(new Date()));
    const allDone = todayTasks.length > 0 && todayTasks.every((t) => t.completed);
    if (allDone && !prevAllCompleted.current) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    prevAllCompleted.current = allDone;
  }, [completions, getTasksForDate, isLoaded]);

  // ========== 数据导出/导入 ==========

  const handleExport = () => {
    const data = {
      templates,
      oneoffs,
      completions,
      categories: customCategories,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `routine-tracker-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // 逐条调用 API 写入数据库
        if (data.templates) {
          for (const t of data.templates) {
            await api.createTemplate({
              title: t.title, category: t.category,
              repeatDays: t.repeatDays, hour: t.hour, duration: t.duration,
            });
          }
        }
        if (data.oneoffs) {
          for (const o of data.oneoffs) {
            await api.createOneoff({
              title: o.title, category: o.category,
              date: o.date, hour: o.hour, duration: o.duration,
            });
          }
        }
        if (data.completions) {
          await api.bulkImportCompletions(data.completions);
        }
        if (data.categories) {
          for (const [key, config] of Object.entries(data.categories)) {
            await api.createCategory(key, config as CategoryConfig);
          }
        }
        // 重新加载全部数据
        const [t, o, c, cat] = await Promise.all([
          api.fetchTemplates(), api.fetchOneoffs(),
          api.fetchCompletions(), api.fetchCategories(),
        ]);
        setTemplates(t);
        setOneoffs(o);
        setCompletions(c);
        setCustomCategories(cat);
      } catch {
        alert("导入失败：文件格式不正确");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ========== 日历导航 ==========

  const handlePrev = () => {
    if (viewMode === "month") {
      const prev = getPrevMonth(currentYear, currentMonth);
      setCurrentYear(prev.year);
      setCurrentMonth(prev.month);
    } else {
      setWeekStart(getPrevWeek(weekStart));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      const next = getNextMonth(currentYear, currentMonth);
      setCurrentYear(next.year);
      setCurrentMonth(next.month);
    } else {
      setWeekStart(getNextWeek(weekStart));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(formatDate(today));
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setWeekStart(getWeekDates(today)[0]);
  };

  const handleToggleView = () => {
    const dateObj = new Date(selectedDate + "T00:00:00");
    if (viewMode === "month") {
      setWeekStart(getWeekDates(dateObj)[0]);
      setViewMode("week");
    } else {
      setCurrentYear(dateObj.getFullYear());
      setCurrentMonth(dateObj.getMonth());
      setViewMode("month");
    }
  };

  // ---- 点击日期 → 选中 + 打开弹窗 ----
  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setModalDate(dateStr);
  };

  // ---- 日期显示 ----
  const todayStr = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 周视图的年月显示
  const weekMid = new Date(
    weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 3
  );
  const displayYear = viewMode === "month" ? currentYear : weekMid.getFullYear();
  const displayMonth = viewMode === "month" ? currentMonth : weekMid.getMonth();

  return (
    <div className="container py-8">
      {/* ---- 庆祝动画 ---- */}
      <Confetti show={showConfetti} />

      {/* ---- 头部 ---- */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daily Routine Tracker</h1>
        <p className="text-gray-500 mt-1 text-sm">{todayStr}</p>
      </header>

      {/* ---- 统计面板 ---- */}
      <StatsPanel getTasksForDate={getTasksForDate} streak={streak} />

      {/* ---- 日历导航 ---- */}
      <CalendarHeader
        year={displayYear}
        month={displayMonth}
        viewMode={viewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToggleView={handleToggleView}
        onToday={handleToday}
      />

      {/* ---- 日历视图（月 or 周） ---- */}
      {viewMode === "month" ? (
        <MonthView
          year={currentYear}
          month={currentMonth}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          getTasksForDate={getTasksForDate}
        />
      ) : (
        <WeekView
          weekStartDate={weekStart}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          getTasksForDate={getTasksForDate}
          onToggle={handleToggle}
          categories={categories}
        />
      )}

      {/* ---- 模态弹窗 ---- */}
      {modalDate && (
        <DayModal
          date={modalDate}
          tasks={getTasksForDate(modalDate)}
          categories={categories}
          onToggle={handleToggle}
          onDelete={handleDeleteOneOff}
          onAddOneOff={handleAddOneOff}
          onEditOneOff={handleEditOneOff}
          onAddCategory={handleAddCategory}
          onAddTemplate={handleAddTemplate}
          onRemoveOneOffs={handleRemoveOneOffs}
          onClose={() => setModalDate(null)}
        />
      )}

      {/* ---- 模板管理 ---- */}
      <TemplateManager
        templates={templates}
        categories={categories}
        onAdd={handleAddTemplate}
        onEdit={handleEditTemplate}
        onDelete={handleDeleteTemplate}
        onAddCategory={handleAddCategory}
      />

      {/* ---- 数据管理 ---- */}
      <div className="flex gap-3 justify-center mt-6 mb-4">
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-border rounded-lg
            hover:bg-gray-50 transition-colors"
        >
          导出数据
        </button>
        <label
          className="px-4 py-2 text-sm text-gray-600 border border-gray-border rounded-lg
            hover:bg-gray-50 transition-colors cursor-pointer"
        >
          导入数据
          <input type="file" accept=".json" hidden onChange={handleImport} />
        </label>
      </div>
    </div>
  );
}
