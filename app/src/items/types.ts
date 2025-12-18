import { Item } from "../types/item.js";

export type Args = {
  page: {
    category2: number;
    limit: number;
  };
  item: Partial<Item>;
  output: string;
};
