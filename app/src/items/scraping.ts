import puppeteer, { Page } from "puppeteer-core";
import { type Item } from "../types/index.js";
import { Args } from "./types.js";
import { writeJsonToFile } from "../utils/file.js";
import { wait } from "../utils/wait.js";
import {
  PUPPETEER_LAUNCH_OPTION,
  PUPPETEER_PAGE_VIEWPORT,
  PUPPETEER_USER_AGENT,
} from "../constants.js";

/**
 * NOTE: 抽出するもの
 * - id
 * - name
 * - category2: 武器・道具・防具などの大分類。idなどではなくそのままの文字列を取得。
 * - category3: 片手剣、両手剣、盾などの小分類。idなどではなくそのままの文字列を取得。
 * - level: レベル
 *
 * 件数が多いため、category2を1セットとして扱い、pageをループして取得する。
 *
 * NOTE: コードの共通化はやったほうがいいけど、優先度は低いので気が向いたときにやる。
 */

type GetItemOption = {
  item: Partial<Item>;
};

const getItems = async (page: Page, option: GetItemOption): Promise<Item[]> => {
  // NOTE: ここのスコープはconsole.log()が出力される
  return await page.evaluate(async (option: GetItemOption) => {
    // NOTE: ここのスコープはconsole.log()が出力されない
    const elements = document.querySelectorAll("#character > tbody > tr");
    const Items: Item[] = [];

    elements.forEach((element) => {
      const href = element
        .querySelector(
          "td.db-table__body--light.latest_patch__major__item > div.db-table__link_txt > a",
        )
        .getAttribute("href");

      // NOTE: {id}部分を抽出する
      // 例: /lodestone/playguide/db/item/{id}/
      const parts = href.split("/");
      const id = parts[parts.length - 2];

      const name = element.querySelector(
        "td.db-table__body--light.latest_patch__major__item > div.db-table__link_txt > a",
      ).innerHTML;
      const category2 = element.querySelector(
        "td.db-table__body--light.latest_patch__major__item > div.db-table__link_txt > span > a",
      ).innerHTML;
      const level = element.querySelector(
        "td.db-table__body--dark.db-table__body--center",
      ).innerHTML;

      if (
        id === undefined ||
        name === undefined ||
        category2 === undefined ||
        level === undefined
      ) {
        throw new Error("parse error: getItems");
      }

      Items.push({
        id: id,
        name: name,
        category1: option.item.category1,
        category2: category2,
        level: parseInt(level),
      });
    });

    return Items;
  }, option);
};

export const engine = async (args: Args) => {
  const browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTION);
  const page = await browser.newPage();
  await page.setUserAgent(PUPPETEER_USER_AGENT);
  await page.setViewport(PUPPETEER_PAGE_VIEWPORT);

  let items: Item[] = [];
  for (let pageNumber = 1; pageNumber <= args.page.limit; pageNumber++) {
    // FIX: アイテムとアイテムの間に追加されることがあるのでソートして取得するように修正したほうが良さそう
    const url = `https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/?category2=${args.page.category2}&page=${pageNumber}`;
    await page.goto(url);
    await wait(1500);
    const currentItems = await getItems(page, { item: args.item });
    console.log("page:", pageNumber);
    items = [...items, ...currentItems];
  }

  await writeJsonToFile(args.output, items);

  await browser.close();
};
