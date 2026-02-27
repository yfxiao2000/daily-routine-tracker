# 后端学习笔记：从 localStorage 到数据库

## 目录

1. [为什么需要数据库](#1-为什么需要数据库)
2. [关系型数据库核心概念](#2-关系型数据库核心概念)
3. [Prisma ORM 是什么](#3-prisma-orm-是什么)
4. [Schema 文件详解](#4-schema-文件详解)
5. [数据库迁移 Migration](#5-数据库迁移-migration)
6. [API 路由详解](#6-api-路由详解)
7. [完整数据流](#7-完整数据流)
8. [常用命令速查](#8-常用命令速查)

---

## 1. 为什么需要数据库

### 之前：localStorage

```
浏览器 → localStorage（存在浏览器里）
```

**问题：**
- 换浏览器数据就没了
- 清除浏览器数据就丢了
- 别的设备看不到
- 数据量大了会变慢

### 现在：数据库

```
浏览器 ←→ API 路由 ←→ Prisma ORM ←→ SQLite 数据库文件
```

**好处：**
- 数据存在服务器上的文件里，刷新不丢
- 未来可以换成 PostgreSQL，支持多设备访问
- 数据有结构、可查询

---

## 2. 关系型数据库核心概念

### 表（Table）

数据库就是一组**表格**。每个表存一种东西：

| 概念 | 类比 | 我们的例子 |
|------|------|-----------|
| 表（Table） | Excel 的一个 sheet | Template 表、OneOff 表 |
| 行（Row） | Excel 的一行 | 一条模板记录 |
| 列（Column） | Excel 的一列 | title、hour、duration |

### 主键（Primary Key）

每一行的**唯一身份证号**。在我们的项目中：

```
Template 表:
  id = "cm8abc123..."  ← 主键，每行不同
  id = "cm8def456..."
  id = "cm8ghi789..."
```

Prisma 用 `@id @default(cuid())` 自动生成主键。

### 外键（Foreign Key）— 表之间的关联

> 我们的项目暂时没用外键（为了简单），但这是重要概念。

假设 Template 的 `category` 字段指向 Category 表的 `key`，这就是外键：

```
Template 表:          Category 表:
id: "abc"             key: "exercise"
category: "exercise" ──→ label: "运动"
                         color: "text-orange-600"
```

### 唯一约束（Unique Constraint）

防止重复数据。我们的 Completion 表用了**联合唯一约束**：

```prisma
@@unique([date, sourceType, sourceId])
```

这意味着同一天（date）+ 同一类型（sourceType）+ 同一来源（sourceId）只能有一条记录。

---

## 3. Prisma ORM 是什么

**ORM** = Object-Relational Mapping（对象关系映射）

简单说：**用 TypeScript 代码操作数据库，不用写 SQL**。

### 没有 ORM 的写法（原始 SQL）：

```sql
SELECT * FROM Template WHERE id = 'abc123';
INSERT INTO Template (title, category, hour) VALUES ('晨跑', 'exercise', 7);
```

### 有 Prisma 的写法（TypeScript）：

```typescript
// 查找
const template = await prisma.template.findUnique({ where: { id: 'abc123' } });

// 创建
const newTemplate = await prisma.template.create({
  data: { title: '晨跑', category: 'exercise', hour: 7, duration: 1, repeatDays: '[1,2,3,4,5]' }
});

// 更新
await prisma.template.update({
  where: { id: 'abc123' },
  data: { title: '晨练' }
});

// 删除
await prisma.template.delete({ where: { id: 'abc123' } });
```

Prisma 自动把你的 TypeScript 代码翻译成 SQL。

---

## 4. Schema 文件详解

文件位置：`prisma/schema.prisma`

### 基础配置

```prisma
generator client {
  provider = "prisma-client"       // 使用 Prisma 客户端
  output   = "../app/generated/prisma"  // 生成代码的位置
}

datasource db {
  provider = "sqlite"  // 数据库类型（还可以是 postgresql、mysql）
}
```

### 定义一个 Model（= 一张表）

```prisma
model Template {
  id         String   @id @default(cuid())  // @id = 主键, @default(cuid()) = 自动生成
  title      String                          // 普通字段
  category   String
  repeatDays String                          // 存 JSON 字符串
  hour       Int      @default(9)            // @default(9) = 默认值为 9
  duration   Float    @default(1)            // Float = 浮点数（支持 0.5, 1.5 等）
  createdAt  DateTime @default(now())        // @default(now()) = 自动记录创建时间
}
```

### 字段类型对照

| Prisma 类型 | TypeScript 类型 | 说明 |
|-------------|----------------|------|
| String | string | 文本 |
| Int | number | 整数 |
| Float | number | 浮点数 |
| Boolean | boolean | 布尔值 |
| DateTime | Date | 日期时间 |

### 联合唯一约束

```prisma
model Completion {
  id         Int     @id @default(autoincrement())  // 自增整数主键
  date       String
  sourceType String
  sourceId   String
  completed  Boolean @default(true)

  @@unique([date, sourceType, sourceId])  // 这三个字段组合起来必须唯一
}
```

---

## 5. 数据库迁移 Migration

### 什么是迁移？

迁移 = 数据库的**版本控制**。

就像 Git 记录代码的变化，Migration 记录数据库结构的变化：

```
migrations/
  └─ 20260227_init/        ← 第一次：创建所有表
      └─ migration.sql     ← 实际的 SQL 命令
```

### 工作流程

1. 修改 `prisma/schema.prisma`（比如加个新字段）
2. 运行 `npx prisma migrate dev --name 描述`
3. Prisma 自动：
   - 对比 schema 和数据库的差异
   - 生成 SQL 迁移文件
   - 执行 SQL 更新数据库
   - 重新生成 TypeScript 类型

### 例子：给 Template 表加一个 `description` 字段

```prisma
model Template {
  id          String   @id @default(cuid())
  title       String
  description String?   // ← 新加的！? 表示可选（可以为 null）
  // ... 其他字段
}
```

然后运行：

```bash
npx prisma migrate dev --name add-description
```

---

## 6. API 路由详解

### REST API 是什么

REST 是一种设计风格，用 HTTP 方法表示不同操作：

| HTTP 方法 | 操作 | 例子 |
|-----------|------|------|
| GET | 读取 | `GET /api/templates` → 获取所有模板 |
| POST | 创建 | `POST /api/templates` → 创建新模板 |
| PUT | 更新 | `PUT /api/templates/abc` → 更新指定模板 |
| DELETE | 删除 | `DELETE /api/templates/abc` → 删除指定模板 |

这四种操作合称 **CRUD**（Create, Read, Update, Delete）。

### Next.js 路由文件 → URL 映射

```
文件路径                              → URL
app/api/templates/route.ts           → /api/templates       (GET, POST)
app/api/templates/[id]/route.ts      → /api/templates/:id   (PUT, DELETE)
app/api/oneoffs/route.ts             → /api/oneoffs          (GET, POST)
app/api/oneoffs/[id]/route.ts        → /api/oneoffs/:id      (PUT, DELETE)
app/api/completions/route.ts         → /api/completions      (GET, PUT)
app/api/completions/bulk/route.ts    → /api/completions/bulk (PUT)
app/api/categories/route.ts          → /api/categories       (GET, POST)
```

`[id]` 是**动态路由**参数，比如 `/api/templates/abc123` 中 `params.id = "abc123"`。

### 一个 API 路由的结构

```typescript
// app/api/templates/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET 处理函数 — 当有人请求 GET /api/templates 时执行
export async function GET() {
  // 1. 从数据库查询
  const rows = await prisma.template.findMany();

  // 2. 返回 JSON 响应
  return NextResponse.json(rows);
}

// POST 处理函数 — 当有人请求 POST /api/templates 时执行
export async function POST(request: NextRequest) {
  // 1. 读取请求体中的数据
  const body = await request.json();

  // 2. 写入数据库
  const created = await prisma.template.create({
    data: { title: body.title, ... }
  });

  // 3. 返回创建的数据
  return NextResponse.json(created, { status: 201 });
}
```

### 前端如何调用 API

```typescript
// lib/api.ts

// GET 请求（获取数据）
export async function fetchTemplates() {
  const res = await fetch("/api/templates");  // 浏览器发起 HTTP GET 请求
  return res.json();                           // 解析 JSON 响应
}

// POST 请求（发送数据）
export async function createTemplate(data) {
  const res = await fetch("/api/templates", {
    method: "POST",                            // 指定 HTTP 方法
    headers: { "Content-Type": "application/json" },  // 告诉服务器发的是 JSON
    body: JSON.stringify(data),                // 把数据转成 JSON 字符串
  });
  return res.json();
}
```

---

## 7. 完整数据流

以"用户添加一个新任务"为例：

```
用户点击 "添加任务"
     │
     ▼
page.tsx: handleAddOneOff()
     │
     ▼
lib/api.ts: createOneoff()
     │  fetch("/api/oneoffs", { method: "POST", body: {...} })
     ▼
app/api/oneoffs/route.ts: POST()
     │  const body = await request.json()
     ▼
lib/prisma.ts: prisma.oneOff.create({ data: body })
     │  Prisma 把 TypeScript 翻译成 SQL:
     │  INSERT INTO OneOff (id, title, ...) VALUES (...)
     ▼
dev.db (SQLite 文件)
     │  数据写入磁盘
     ▼
返回创建的数据 (JSON)
     │
     ▼
page.tsx: setOneoffs(prev => [...prev, created])
     │  更新 React 状态，UI 刷新
     ▼
用户看到新任务出现在列表中
```

### 对比 localStorage 的流程

```
之前 (localStorage):
  handleAddOneOff() → setOneoffs([...]) → useEffect → localStorage.setItem()

现在 (数据库):
  handleAddOneOff() → api.createOneoff() → API Route → Prisma → SQLite
                    → setOneoffs([...])  ← 服务器返回数据
```

---

## 8. 常用命令速查

| 命令 | 作用 |
|------|------|
| `npm run db:migrate` | 修改 schema 后运行，更新数据库结构 |
| `npm run db:seed` | 运行种子脚本，插入默认数据 |
| `npm run db:studio` | 打开 Prisma Studio（可视化浏览数据库） |
| `npm run db:reset` | 重置数据库（删除所有数据，重新建表+种子） |
| `npx prisma generate` | 重新生成 Prisma 客户端（修改 schema 后） |

### Prisma Studio

运行 `npm run db:studio` 后，浏览器打开一个界面，可以直接看到数据库里的数据：

```
┌─────────────────────────────────┐
│  Prisma Studio                  │
│                                 │
│  Template (3 records)      →    │
│  OneOff (5 records)        →    │
│  Completion (12 records)   →    │
│  Category (6 records)      →    │
└─────────────────────────────────┘
```

点进去可以看到每一行数据，也可以直接编辑。

---

## 项目文件结构（后端部分）

```
项目根目录/
├── prisma/
│   ├── schema.prisma          ← 数据库表定义（最重要的文件）
│   ├── seed.ts                ← 种子脚本（插入默认分类）
│   └── migrations/            ← 迁移记录（自动生成）
│       └── 20260227_init/
│           └── migration.sql
├── prisma.config.ts           ← Prisma 配置
├── .env                       ← 环境变量（数据库路径）
├── dev.db                     ← SQLite 数据库文件（自动生成）
├── lib/
│   ├── prisma.ts              ← Prisma 客户端单例
│   └── api.ts                 ← 前端 API 调用封装
├── app/
│   ├── api/                   ← API 路由（后端代码）
│   │   ├── templates/
│   │   │   ├── route.ts       ← GET /api/templates, POST
│   │   │   └── [id]/
│   │   │       └── route.ts   ← PUT /api/templates/:id, DELETE
│   │   ├── oneoffs/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── completions/
│   │   │   ├── route.ts
│   │   │   └── bulk/
│   │   │       └── route.ts
│   │   └── categories/
│   │       └── route.ts
│   └── generated/prisma/      ← Prisma 自动生成的客户端代码
│       └── client.ts
└── package.json               ← 新增 db:* 脚本
```

---

## 关键词总结

| 术语 | 解释 |
|------|------|
| **数据库（Database）** | 结构化存储数据的系统 |
| **表（Table）** | 数据库中的一张表，存一类数据 |
| **行（Row）** | 表中的一条记录 |
| **列（Column）** | 表中的一个字段 |
| **主键（Primary Key）** | 每行的唯一标识 |
| **外键（Foreign Key）** | 指向另一张表的主键，建立关联 |
| **唯一约束（Unique）** | 确保某个字段（组合）不重复 |
| **ORM** | 用编程语言操作数据库的工具 |
| **Prisma** | Node.js/TypeScript 最流行的 ORM |
| **Schema** | 数据库的结构定义 |
| **Migration** | 数据库结构的版本变更记录 |
| **Seed** | 向数据库插入初始数据 |
| **CRUD** | Create、Read、Update、Delete |
| **REST API** | 用 HTTP 方法 (GET/POST/PUT/DELETE) 操作资源 |
| **适配器（Adapter）** | 连接 Prisma 和具体数据库的桥梁 |
