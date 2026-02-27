"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { DayTask, Category, CategoryConfig, RoutineTemplate } from "@/types/routine";
import DayTaskList from "./DayTaskList";

interface DayModalProps {
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
  onClose: () => void;
}

export default function DayModal({
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
  onClose,
}: DayModalProps) {
  // ---- 按 Esc 关闭弹窗 ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    // 阻止背景滚动
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ---- 半透明遮罩 ---- */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* ---- 弹窗面板 ---- */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[600px] max-h-[85vh] mx-4
        flex flex-col overflow-hidden">
        {/* ---- 关闭按钮 ---- */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center
            rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600
            transition-colors z-10"
        >
          ✕
        </button>

        {/* ---- 内容区（可滚动） ---- */}
        <div className="p-5 overflow-y-auto">
          <DayTaskList
            date={date}
            tasks={tasks}
            categories={categories}
            onToggle={onToggle}
            onDelete={onDelete}
            onAddOneOff={onAddOneOff}
            onEditOneOff={onEditOneOff}
            onAddCategory={onAddCategory}
            onAddTemplate={onAddTemplate}
            onRemoveOneOffs={onRemoveOneOffs}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
