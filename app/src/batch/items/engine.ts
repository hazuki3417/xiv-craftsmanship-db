import { promises as fs } from "fs";
import path from "path";
import { postgresql, wait } from "../../utils/index.js";
import { type Item } from "../../types/index.js";
import { createItemData } from "./query.js";

export const engine = async (filePath: string) => {
  const client = await postgresql.connect(); // クライアントを取得
  try {
    const jsonFilePath = path.join(filePath);

    const data = await fs.readFile(jsonFilePath, "utf8");
    const items = JSON.parse(data) as Item[];

    for (let i = 0; i < items.length; i++) {
      await wait(100);
      createItemData(client, items[i])
        .then(() => {
          console.log("success: ", items[i].id);
        })
        .catch((error) => {
          const log = {
            error,
            tarteg: items[i],
          };
          console.error("create error: ", { error, log });
        });
    }
  } catch (error) {
    console.error("execute error: ", error);
  } finally {
    client.release(); // クライアントを解放
  }
};
