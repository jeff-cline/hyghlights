import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Prisma 7 reads the datasource connection URL for CLI operations
// (db push / studio / introspect) from here. The runtime PrismaClient gets
// its own connection via the pg driver adapter — see src/lib/db.ts.
//
// Schema management uses `prisma db push` against this app's own local
// Postgres database (DATABASE_URL), matching how every other site on the
// server is managed.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
