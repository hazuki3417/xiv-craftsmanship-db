import puppeteer, { Page } from "puppeteer-core";
import { Args } from "./types.js";
import {
  PUPPETEER_LAUNCH_OPTION,
  PUPPETEER_PAGE_VIEWPORT,
  PUPPETEER_USER_AGENT,
} from "./../../constants.js";
import {
  calcTotalPage,
  logError,
  wait,
  writeJsonToFile,
} from "./../../utils/index.js";
import { type Item } from "./../../types/index.js";

/**
 * アイテムの総件数を取得
 * @param page
 * @returns
 */
const getTotalCount = async (page: Page): Promise<number> => {
  try {
    return await page.evaluate(async () => {
      const element = document.querySelector("div.db-filter__row span.total");
      const total = element.textContent;
      if (!element?.textContent) {
        throw new Error("total count element not found");
      }
      return Number(total);
    });
  } catch (error) {
    logError(error, { phase: "getTotalCount" });
    throw error; // 致命的なので上位へ
  }
};

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
  try {
    return await page.evaluate((option: GetItemOption) => {
      const elements = document.querySelectorAll("#character > tbody > tr");
      const items: Item[] = [];

      elements.forEach((element) => {
        try {
          const link = element.querySelector(
            "td.db-table__body--light.latest_patch__major__item > div.db-table__link_txt > a",
          ) as HTMLAnchorElement | null;

          if (!link?.href) return;

          const parts = link.href.split("/");
          const id = parts[parts.length - 2];
          if (!id) return;

          const name = link.textContent?.trim();
          const category2 = element
            .querySelector(
              "td.db-table__body--light.latest_patch__major__item > div.db-table__link_txt > span > a",
            )
            ?.textContent?.trim();

          const levelText = element.querySelector(
            "td.db-table__body--dark.db-table__body--center",
          )?.textContent;

          const level = Number(levelText);

          if (!name || !category2 || Number.isNaN(level)) return;

          items.push({
            id,
            name,
            category1: option.item.category1!,
            category2,
            level,
          });
        } catch {
          // 行単位の失敗は無視
        }
      });

      return items;
    }, option);
  } catch (error) {
    logError(error, { phase: "getItems" });
    return []; // ページ単位で継続
  }
};

export const engine = async (args: Args) => {
  const browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTION);
  const page = await browser.newPage();

  try {
    await page.setUserAgent(PUPPETEER_USER_AGENT);
    await page.setViewport(PUPPETEER_PAGE_VIEWPORT);

    const baseUrl = `https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/?category2=${args.page.category2}`;
    const target =
      args.page.patch === undefined
        ? baseUrl
        : `${baseUrl}&patch=${args.page.patch}`;

    await page.goto(target);
    await wait(500);

    const totalCount = await getTotalCount(page);
    const pageCount = calcTotalPage(totalCount);

    console.log("status", { args, totalCount, pageCount, target });

    const items: Item[] = [];

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const pageUrl = `${target}&page=${pageNumber}`;
      try {
        await page.goto(pageUrl);
        await wait(1500);

        const currentItems = await getItems(page, { item: args.item });
        items.push(...currentItems);

        console.log("page success:", pageNumber);
      } catch (error) {
        logError(error, {
          phase: "page loop",
          pageNumber,
          pageUrl,
        });
        // continue
      }
    }

    await writeJsonToFile(args.output, items);
  } catch (error) {
    logError(error, { phase: "engine" });
    throw error; // CI では失敗させる
  } finally {
    await browser.close();
  }
};
