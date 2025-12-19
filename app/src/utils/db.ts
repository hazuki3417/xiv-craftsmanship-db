import pkg from "pg";

const { Pool } = pkg;

// データベース接続設定
export const postgresql = new Pool({
  user: "example",
  host: "localhost",
  database: "example",
  password: "example",
  port: 5432,
});
