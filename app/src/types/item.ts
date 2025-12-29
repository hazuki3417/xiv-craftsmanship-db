import { MAP_ITEM_CATEGORY2 } from "../constants.js";

export type ItemCategory2 = keyof typeof MAP_ITEM_CATEGORY2;

/**
 * スクレイピングして得た情報をまとめるデータモデル
 */
export type Item = {
  id: string;
  name: string;
  level: number | null;
};
