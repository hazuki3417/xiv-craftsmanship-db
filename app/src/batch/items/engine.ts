import { promises as fs } from "fs";
import path from "path";
import { wait } from "../../utils/index.js";
import { type Item } from "../../types/index.js";
import { createItemData } from "./query.js";

export const engine = async (filePath: string) => {
  try {
    const jsonFilePath = path.join(filePath);

    const data = await fs.readFile(jsonFilePath, "utf8");
    const items = JSON.parse(data) as Item[];

    for (let i = 0; i < items.length; i++) {
      await wait(100);
      createItemData(items[i])
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
  }
};
