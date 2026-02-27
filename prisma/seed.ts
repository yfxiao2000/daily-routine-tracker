// 种子脚本：向数据库插入默认分类数据
// 运行方式：npx prisma db seed

import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

// 这些和 types/routine.ts 中的 DEFAULT_CATEGORIES 保持一致
const DEFAULT_CATEGORIES = {
  exercise: { label: "运动", color: "text-orange-600", bg: "bg-orange-100" },
  study:    { label: "学习", color: "text-blue-600",   bg: "bg-blue-100" },
  health:   { label: "健康", color: "text-green-600",  bg: "bg-green-100" },
  other:    { label: "其他", color: "text-gray-600",   bg: "bg-gray-100" },
};

async function main() {
  console.log("开始插入默认分类...");

  for (const [key, config] of Object.entries(DEFAULT_CATEGORIES)) {
    // upsert = 如果存在就跳过，不存在就创建
    await prisma.category.upsert({
      where: { key },
      update: {},  // 已存在则不修改
      create: { key, ...config, isDefault: true },
    });
    console.log(`  ✓ ${key} → ${config.label}`);
  }

  console.log("种子数据插入完成！");
}

main()
  .catch((e) => {
    console.error("种子脚本执行失败:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
