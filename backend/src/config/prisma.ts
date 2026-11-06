import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const databaseUrl = new URL(env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host:
    databaseUrl.hostname === "localhost" ? "127.0.0.1" : databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.replace(/^\//, ""),
  connectionLimit: 10,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
