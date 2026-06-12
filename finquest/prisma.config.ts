import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

// SQLite file URLs are resolved relative to the schema dir by the CLI but
// relative to the process CWD at runtime; pin to an absolute path so both agree.
const rawUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const datasourceUrl = rawUrl.startsWith("file:")
  ? `file:${path.resolve(rawUrl.slice("file:".length))}`
  : rawUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
