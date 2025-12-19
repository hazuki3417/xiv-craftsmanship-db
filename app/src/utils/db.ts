import pkg from "pg";

const { Pool } = pkg;

// データベース接続設定
export const postgresql = new Pool({
  user: "example",
  host: "xiv-craftsmanship-db",
  database: "example",
  password: "example",
  port: 5432,
});
