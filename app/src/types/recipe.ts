import { MAP_RECIPE_CATEGORY2 } from "../constants.js";

export type RecipeCategory2 = keyof typeof MAP_RECIPE_CATEGORY2;

/**
 * スクレイピングして得た情報をまとめるデータモデル
 */
export type Recipe = {
  id: string;
  name: string;
  level: number;
  pieces: number; // 完成個数
  materials: Material[];
  crystals: Crystal[];
};

export type Material = {
  id: string;
  name: string;
  quantity: number;
};

export type Crystal = {
  id: string;
  name: string;
  quantity: number;
};
