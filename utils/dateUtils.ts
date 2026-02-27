// ============================================
// 日期工具函数（纯原生 JavaScript，无外部库）
// ============================================

// ---- 格式化日期为 "YYYY-MM-DD" 字符串 ----
// 这是整个 App 统一使用的日期格式，用作 localStorage 的 key
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ---- 获取一个月有多少天 ----
// 技巧：下个月的第 0 天 = 这个月的最后一天
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// ---- 获取某月 1 号是星期几（0=周日, 1=周一, ..., 6=周六） ----
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// ---- 构建月视图的 42 个日期格子（6 行 × 7 列） ----
// 包含上月末尾和下月开头的"填充日"
export function getMonthGridDates(year: number, month: number): Date[] {
  const firstDay = getFirstDayOfMonth(year, month);
  const dates: Date[] = [];
  for (let i = 0; i < 42; i++) {
    // 从 1 号往前推 firstDay 天，得到网格起始日期
    dates.push(new Date(year, month, 1 - firstDay + i));
  }
  return dates;
}

// ---- 获取某一天所在周的 7 个日期（周日开始） ----
export function getWeekDates(date: Date): Date[] {
  const dayOfWeek = date.getDay(); // 0=周日
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(
      new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfWeek + i)
    );
  }
  return dates;
}

// ---- 导航：上个月 ----
export function getPrevMonth(year: number, month: number) {
  return month === 0
    ? { year: year - 1, month: 11 }
    : { year, month: month - 1 };
}

// ---- 导航：下个月 ----
export function getNextMonth(year: number, month: number) {
  return month === 11
    ? { year: year + 1, month: 0 }
    : { year, month: month + 1 };
}

// ---- 导航：上一周（倒退 7 天） ----
export function getPrevWeek(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
}

// ---- 导航：下一周（前进 7 天） ----
export function getNextWeek(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
}

// ---- 判断两个日期是否是同一天 ----
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ---- 判断是否是今天 ----
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

// ---- 格式化小时为 "HH:00" 字符串 ----
// 例如：7 → "07:00"，14 → "14:00"
export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

// ---- 格式化时间范围 ----
// 例如：formatTimeRange(9, 1.5) → "09:00-10:30"
export function formatTimeRange(hour: number, duration: number): string {
  const endMinutes = hour * 60 + duration * 60;
  const endH = Math.floor(endMinutes / 60);
  const endM = Math.round(endMinutes % 60);
  return `${String(hour).padStart(2, "0")}:00-${String(Math.min(endH, 23)).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

// ---- 构建完成记录的 key ----
// 格式："2026-02-25:template:abc123" 或 "2026-02-25:oneoff:xyz789"
export function makeCompletionKey(
  date: string,
  sourceType: "template" | "oneoff",
  sourceId: string
): string {
  return `${date}:${sourceType}:${sourceId}`;
}
