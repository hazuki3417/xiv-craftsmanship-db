import { type Recipe } from "./../../types/index.js";
import { postgresql } from "../../utils/index.js";

export const createRecipeData = async (recipe: Recipe) => {
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

    const job = "木工師";
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
