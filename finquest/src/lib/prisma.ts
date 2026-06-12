import path from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@/generated/prisma/client';

// SQLite file URLs resolve inconsistently between the Prisma CLI and the
// bundled runtime; anchor them to the project root so both hit the same file.
function resolveDatasourceUrl(): string {
  const rawUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
  if (!rawUrl.startsWith('file:')) return rawUrl;
  return `file:${path.resolve(process.cwd(), rawUrl.slice('file:'.length))}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: resolveDatasourceUrl() }) });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
