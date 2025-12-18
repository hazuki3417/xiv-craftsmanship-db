import { promises as fs } from "fs";
import path from "path";
import pkg from "pg";
import { writeFile } from "fs/promises";

const { Pool } = pkg;

// データベース接続設定
const postgresql = new Pool({
  user: "example",
  host: "localhost",
  database: "example",
  password: "example",
  port: 5432,
});

type Recipe = {
  id: string;
  name: string;
  level: number;
  pieces: number; // 完成個数
  materials: Material[];
  crystals: Crystal[];
};

type Material = {
  id: string;
  name: string;
  quantity: number;
};

type Crystal = {
  id: string;
  name: string;
  quantity: number;
};

const writeJsonToFile = async (
  filePath: string,
  jsonObject: object,
): Promise<void> => {
  try {
    // JSONオブジェクトを文字列に変換
    const jsonString = JSON.stringify(jsonObject, null, 2);

    // ファイルに書き込む
    await writeFile(filePath, jsonString, "utf8");

    console.log("File written successfully");
  } catch (error) {
    console.error("Error writing file:", error);
  }
};

const createRecipeData = async (recipe: Recipe) => {
  const client = await postgresql.connect(); // クライアントを取得

  try {
    await client.query("BEGIN"); // トランザクションを開始

    const target = await postgresql.query<{
      id: string;
      name: string;
      level: number;
    }>("SELECT * FROM items WHERE name = $1", [recipe.name]);

    if (target.rowCount === 0) {
      throw new Error("Item not found");
    }

    const item = target.rows[0];

    const job = "錬金術師";
    await client.query(
      `INSERT INTO public.recipes(id, item_id, "level", pieces, job)VALUES($1, $2, $3, $4, $5);`,
      [recipe.id, item.id, recipe.level, recipe.pieces, job],
    );

    await recipe.crystals.forEach(async (crystal) => {
      await client.query(
        `INSERT INTO public.item_tree(id, recipe_id, parent_item_id, child_item_id, quantity, "type")VALUES(uuid_generate_v4(),$1, $2, $3, $4, $5);`,
        [recipe.id, item.id, crystal.id, crystal.quantity, "crystal"],
      );
    });

    await recipe.materials.forEach(async (material) => {
      await client.query(
        `INSERT INTO public.item_tree(id, recipe_id, parent_item_id, child_item_id, quantity, "type")VALUES(uuid_generate_v4(),$1, $2, $3, $4, $5);`,
        [recipe.id, item.id, material.id, material.quantity, "material"],
      );
    });

    await client.query("COMMIT"); // トランザクションをコミット
    console.log("Users created successfully.");
  } catch (error) {
    await client.query("ROLLBACK"); // エラーが発生した場合はロールバック
    throw error;
  } finally {
    client.release(); // クライアントを解放
  }
};

(async () => {
  try {
    const jsonFilePath = path.join("datastore/recipes/6.alchemist.json");

    const data = await fs.readFile(jsonFilePath, "utf8");
    const recipes = JSON.parse(data) as Recipe[];

    for (let i = 0; i < recipes.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      createRecipeData(recipes[i])
        .then(() => {
          console.log("success: ", recipes[i].id);
        })
        .catch((err) => {
          const log = {
            error: err,
            tarteg: recipes[i],
          };
          writeJsonToFile(
            `./datastore/recipes/logs/${recipes[i].id}.json`,
            log,
          );
        });
    }
  } catch (error) {
    console.error("execute error: ", error);
  }
})();
