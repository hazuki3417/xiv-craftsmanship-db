import { promises as fs } from "fs";
import path from "path";
import { wait } from "../../utils/index.js";
import { type Recipe } from "../../types/index.js";
import { createRecipeData } from "./query.js";

// TODO: レシピ情報はスクリプトで作成しているが、アイテム情報を入れるスクリプトはないので実装が必要
(async () => {
  try {
    const jsonFilePath = path.join("datastore/recipes/0.carpenter.json");

    const data = await fs.readFile(jsonFilePath, "utf8");
    const recipes = JSON.parse(data) as Recipe[];

    for (let i = 0; i < recipes.length; i++) {
      await wait(500);
      createRecipeData(recipes[i])
        .then(() => {
          console.log("success: ", recipes[i].id);
        })
        .catch((error) => {
          const log = {
            error,
            tarteg: recipes[i],
          };
          console.error("error: ", { error, log });
        });
    }
  } catch (error) {
    console.error("execute error: ", error);
  }
})();
