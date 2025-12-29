import { type Item } from "./../../types/index.js";
import { PoolClient } from "pg";

export interface CreateItemDataArgs {
  client: PoolClient;
  item: Item;
}

export const createItemData = async (args: CreateItemDataArgs) => {
  const { client, item } = args;
  try {
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
  } catch (error) {
    throw error;
  }
};
