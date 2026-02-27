import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Prisma 7 需要显式传入数据库适配器（adapter）
// 这里使用 better-sqlite3 作为 SQLite 的适配器
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

// 单例模式：防止 Next.js 热重载时创建多个数据库连接
// 开发时每次代码修改都会重新加载模块，如果不用单例，
// 每次重载都会创建新的 PrismaClient 实例，最终耗尽连接数

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
