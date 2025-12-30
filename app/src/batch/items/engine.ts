import { postgresql, stderr, stdout } from "../../utils/index.js";
import { type Item } from "../../types/index.js";
import { createItemData } from "./query.js";
import fs from "fs";
import readline from "readline";

export interface EngineArgs {
  path: string;
}

export const engine = async (args: EngineArgs) => {
  const { path } = args;
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
      let item = JSON.parse(line) as Item; // ← 1 行 = 1 JSON
      try {
        item = JSON.parse(line) as Item;
      } catch (error) {
        stderr(`error: parse error. ${line}\n`);
        throw error;
      }
      await createItemData({ client, item });
      stdout(`success: ${JSON.stringify(item)}\n`);
    }
    await client.query("COMMIT"); // トランザクションをコミット
  } catch (error) {
    await client.query("ROLLBACK"); // エラーが発生した場合はロールバック
    throw error;
  } finally {
    client.release(); // クライアントを解放
  }
};
