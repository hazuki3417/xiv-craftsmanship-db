import { promises as fs } from "fs";
import path from "path";
import { postgresql, wait } from "../../utils/index.js";
import { type Item } from "../../types/index.js";
import { createItemData } from "./query.js";

export const engine = async (filePath: string) => {
  const client = await postgresql.connect(); // クライアントを取得
  try {
    await client.query("BEGIN"); // トランザクションを開始

    const jsonFilePath = path.join(filePath);

    const data = await fs.readFile(jsonFilePath, "utf8");
    const items = JSON.parse(data) as Item[];

    for (let i = 0; i < items.length; i++) {
      try {
        await createItemData(client, items[i]);
        console.log("created successfully.", items[i]);
      } catch (error) {
        const log = {
          error,
          target: items[i],
        };
        console.error("create error: ", { error, log });
        throw error;
      }
    }
    await client.query("COMMIT"); // トランザクションをコミット
  } catch (error) {
    await client.query("ROLLBACK"); // エラーが発生した場合はロールバック
    console.error("execute error: ", error);
    throw error;
  } finally {
    client.release(); // クライアントを解放
  }
};
