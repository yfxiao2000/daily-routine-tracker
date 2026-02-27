// 前端 API 调用封装
// 所有和后端通信的函数都在这里，page.tsx 只需调用这些函数

import {
  RoutineTemplate,
  OneOffTask,
  CompletionRecord,
  CategoryConfig,
} from "@/types/routine";

const BASE = "/api";

// ============ 模板 ============

export async function fetchTemplates(): Promise<RoutineTemplate[]> {
  const res = await fetch(`${BASE}/templates`);
  return res.json();
}

export async function createTemplate(
  data: Omit<RoutineTemplate, "id">
): Promise<RoutineTemplate> {
  const res = await fetch(`${BASE}/templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTemplate(
  id: string,
  data: Omit<RoutineTemplate, "id">
): Promise<RoutineTemplate> {
  const res = await fetch(`${BASE}/templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteTemplate(id: string): Promise<void> {
  await fetch(`${BASE}/templates/${id}`, { method: "DELETE" });
}

// ============ 单日任务 ============

export async function fetchOneoffs(): Promise<OneOffTask[]> {
  const res = await fetch(`${BASE}/oneoffs`);
  return res.json();
}

export async function createOneoff(
  data: Omit<OneOffTask, "id">
): Promise<OneOffTask> {
  const res = await fetch(`${BASE}/oneoffs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateOneoff(
  id: string,
  data: { hour: number; duration: number }
): Promise<OneOffTask> {
  const res = await fetch(`${BASE}/oneoffs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteOneoff(id: string): Promise<void> {
  await fetch(`${BASE}/oneoffs/${id}`, { method: "DELETE" });
}

// ============ 完成记录 ============

export async function fetchCompletions(): Promise<CompletionRecord> {
  const res = await fetch(`${BASE}/completions`);
  return res.json();
}

export async function toggleCompletion(
  date: string,
  sourceType: string,
  sourceId: string
): Promise<{ completed: boolean }> {
  const res = await fetch(`${BASE}/completions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, sourceType, sourceId }),
  });
  return res.json();
}

export async function bulkImportCompletions(
  record: CompletionRecord
): Promise<void> {
  await fetch(`${BASE}/completions/bulk`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
}

// ============ 分类 ============

export async function fetchCategories(): Promise<
  Record<string, CategoryConfig>
> {
  const res = await fetch(`${BASE}/categories`);
  return res.json();
}

export async function createCategory(
  key: string,
  config: CategoryConfig
): Promise<void> {
  await fetch(`${BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, ...config }),
  });
}
