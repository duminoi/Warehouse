import { Pool, PoolConfig, QueryResultRow } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER || "warehouse_user",
  password: process.env.DB_PASSWORD || "warehouse_pass",
  database: process.env.DB_NAME || "warehouse_management",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(poolConfig);

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client:", err);
  process.exit(-1);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<import("pg").QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV === "development") {
    console.log("[DB Query]", { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
  }

  return result;
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connected:", result.rows[0].now);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

export default pool;
