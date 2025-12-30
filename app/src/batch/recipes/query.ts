import { type Recipe } from "./../../types/index.js";
import { PoolClient } from "pg";

export interface CreateRecipeDataArgs {
  client: PoolClient;
  recipe: Recipe;
  option: {
    job: string;
  };
}

export const createRecipeData = async (args: CreateRecipeDataArgs) => {
  const { client, recipe, option } = args;
  try {
    const target = await client.query<{
      id: string;
      name: string;
      level: number;
    }>("SELECT * FROM items WHERE name = $1", [recipe.name]);

    if (target.rowCount === 0) {
      throw new Error(`Item not found: ${recipe.name}`);
    }

    const item = target.rows[0];

    await client.query(
      `
      INSERT INTO public.recipes (
        id,
        item_id,
        "level",
        pieces,
        job
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id)
      DO UPDATE SET
        "level" = EXCLUDED."level",
        pieces = EXCLUDED.pieces
      `,
      [recipe.id, item.id, recipe.level, recipe.pieces, option.job],
    );

    // NOTE: recipe_idに紐づくitem_treeを一旦削除してから再登録する（item_treeの主キーが自動生成のため）
    await client.query(`DELETE FROM public.item_tree WHERE recipe_id = $1`, [
      recipe.id,
    ]);

    for (const crystal of recipe.crystals) {
      await client.query(
        `INSERT INTO public.item_tree(id, recipe_id, parent_item_id, child_item_id, quantity, "type")VALUES(uuid_generate_v4(),$1, $2, $3, $4, $5);`,
        [recipe.id, item.id, crystal.id, crystal.quantity, "crystal"],
      );
    }

    for (const material of recipe.materials) {
      await client.query(
        `INSERT INTO public.item_tree(id, recipe_id, parent_item_id, child_item_id, quantity, "type")VALUES(uuid_generate_v4(),$1, $2, $3, $4, $5);`,
        [recipe.id, item.id, material.id, material.quantity, "material"],
      );
    }
  } catch (error) {
    throw error;
  }
};
