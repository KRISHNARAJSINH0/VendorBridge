import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

let prismaInstance;

export default function getPrisma() {
  if (typeof window !== "undefined") {
    // Prevent running on the client side
    return null;
  }
  
  if (!prismaInstance) {
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
}
