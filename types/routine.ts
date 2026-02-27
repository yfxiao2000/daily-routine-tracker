// ============================================
// 数据类型定义
// ============================================

// ---- 分类 ----
// Category 使用 string 类型，支持用户自定义分类
export type Category = string;

// 分类配置：每个分类的显示样式
export interface CategoryConfig {
  label: string;
  color: string;  // Tailwind 文字颜色类，如 "text-orange-600"
  bg: string;     // Tailwind 背景颜色类，如 "bg-orange-100"
}

// 默认内置分类（不可删除）
export const DEFAULT_CATEGORIES: Record<string, CategoryConfig> = {
  exercise: { label: "运动", color: "text-orange-600", bg: "bg-orange-100" },
  study:    { label: "学习", color: "text-blue-600",   bg: "bg-blue-100" },
  health:   { label: "健康", color: "text-green-600",  bg: "bg-green-100" },
  other:    { label: "其他", color: "text-gray-600",   bg: "bg-gray-100" },
};

// 预设颜色方案（供用户添加自定义分类时选择）
export const COLOR_PRESETS: { color: string; bg: string }[] = [
  { color: "text-purple-600", bg: "bg-purple-100" },
  { color: "text-pink-600",   bg: "bg-pink-100" },
  { color: "text-red-600",    bg: "bg-red-100" },
  { color: "text-teal-600",   bg: "bg-teal-100" },
  { color: "text-yellow-600", bg: "bg-yellow-100" },
  { color: "text-indigo-600", bg: "bg-indigo-100" },
];

// ---- 星期几 ----
// 和 JavaScript 的 Date.getDay() 一致：0=周日, 1=周一, ..., 6=周六
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: "日", 1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六",
};

// ---- 视图模式 ----
export type ViewMode = "month" | "week";

// ---- 重复模板：定义哪些天自动出现哪个任务 ----
// 例如：{ title: "晨跑", repeatDays: [1,2,3,4,5] } → 每周一到五
export interface RoutineTemplate {
  id: string;
  title: string;
  category: Category;
  repeatDays: DayOfWeek[];
  hour: number;     // 0-23，任务开始的小时
  duration: number;  // 时长（小时），如 0.5, 1, 1.5, 2, 3
}

// ---- 单日任务：只存在于某一天的任务 ----
// 例如：{ title: "牙医预约", date: "2026-03-05" }
export interface OneOffTask {
  id: string;
  title: string;
  category: Category;
  date: string;     // "YYYY-MM-DD"
  hour: number;     // 0-23，任务开始的小时
  duration: number;  // 时长（小时）
}

// ---- 完成记录：追踪每天每个任务是否完成 ----
// key 格式："2026-02-25:template:abc" 或 "2026-02-25:oneoff:xyz"
export interface CompletionRecord {
  [key: string]: boolean;
}

// ---- 日任务：渲染用的计算类型（不存储） ----
// 由模板 + 单日任务 + 完成记录拼装而成
export interface DayTask {
  id: string;                        // React key 用，格式 "template:xxx" 或 "oneoff:xxx"
  sourceType: "template" | "oneoff"; // 来源类型
  sourceId: string;                  // 原始模板或单日任务的 ID
  title: string;
  category: Category;
  completed: boolean;                // 从 CompletionRecord 查出来的
  date: string;                      // "YYYY-MM-DD"
  hour: number;                      // 0-23，任务开始的小时
  duration: number;                  // 时长（小时）
}
