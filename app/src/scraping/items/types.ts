import { Item } from "./../../types/item.js";

export type Args = {
  page: {
    category2: number;
    patch: string | null; // 7.4, 7.3, latestなど（latestを指定した場合はその時の最新。nullなら全パッチ）
  };
  item: Partial<Item>;
  output: string;
};
