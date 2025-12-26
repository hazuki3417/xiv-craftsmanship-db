import { postgresql, stdout } from "../../utils/index.js";
import { type Item } from "../../types/index.js";
import { createItemData } from "./query.js";
import fs from "fs";
import readline from "readline";

export const engine = async (path: string) => {
  const client = await postgresql.connect(); // クライアントを取得
  try {
    await client.query("BEGIN"); // トランザクションを開始

    const stream = fs.createReadStream(path, "utf8");
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (!line.trim()) continue;
      const item = JSON.parse(line) as Item; // ← 1 行 = 1 JSON
      await createItemData(client, item);
      stdout(`success: ${JSON.stringify(item)}\n`);
    }
    await client.query("COMMIT"); // トランザクションをコミット
  } catch (error) {
    await client.query("ROLLBACK"); // エラーが発生した場合はロールバック
    stdout(error);
    throw error;
  } finally {
    client.release(); // クライアントを解放
  }
};
