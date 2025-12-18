import puppeteer, { Page } from "puppeteer-core";
import { writeJsonToFile } from "./../utils/index.js";
import { type Item } from "./../types/index.js";

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

const getItems = async (page: Page): Promise<Item[]> => {
  return await page.evaluate(async () => {
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
        category1: "アクセサリ",
        category2: category2,
        level: parseInt(level),
      });
    });

    return Items;
  });
};

// main function
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });

  let items: Item[] = [];
  const limit = 92;
  for (let pageNumber = 1; pageNumber <= limit; pageNumber++) {
    const url = `https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/?category2=4&page=${pageNumber}`;
    await page.goto(url);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const currentItems = await getItems(page);
    console.log(pageNumber);
    items = [...items, ...currentItems];
  }

  await writeJsonToFile("datastore/items/4.accessorys.json", items);

  await browser.close();
})();
