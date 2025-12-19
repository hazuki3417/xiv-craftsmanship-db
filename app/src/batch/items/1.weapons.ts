import { promises as fs } from "fs";
import path from "path";
import { wait } from "../../utils/index.js";
import { type Item } from "../../types/index.js";
import { createItemData } from "./query.js";



(async () => {
  try {
    const jsonFilePath = path.join("datastore/items/1.weapons.json");

    const data = await fs.readFile(jsonFilePath, "utf8");
    const items = JSON.parse(data) as Item[];

    for (let i = 0; i < items.length; i++) {
      await wait(500);
      createItemData(items[i])
        .then(() => {
          console.log("success: ", items[i].id);
        })
        .catch((error) => {
          const log = {
            error,
            tarteg: items[i],
          };
          console.error("error: ", { error, log });
        });
    }
  } catch (error) {
    console.error("execute error: ", error);
  }
})();
