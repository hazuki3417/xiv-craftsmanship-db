import { type Item } from "./../../types/index.js";
import { PoolClient } from "pg";

export const createItemData = async (client: PoolClient, item: Item) => {
  try {
    await client.query("BEGIN"); // トランザクションを開始

    await client.query(
      `
      INSERT INTO public.items (
        id,
        name,
        level
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (id)
      DO UPDATE SET
        name  = EXCLUDED.name,
        level = EXCLUDED.level;
      `,
      [
        item.id, // PRIMARY KEY
        item.name, // UNIQUE(name)
        item.level, // nullable
      ],
    );

    await client.query("COMMIT"); // トランザクションをコミット
    console.log("item created successfully.", item);
  } catch (error) {
    await client.query("ROLLBACK"); // エラーが発生した場合はロールバック
    throw error;
  }
};
