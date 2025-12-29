import puppeteer, { Page } from "puppeteer-core";
import { Args } from "./types.js";
import {
  PUPPETEER_LAUNCH_OPTION,
  PUPPETEER_PAGE_VIEWPORT,
  PUPPETEER_USER_AGENT,
} from "./../../constants.js";
import { calcTotalPage, wait } from "./../../utils/index.js";
import { type Item } from "./../../types/index.js";
import { stdout } from "../../utils/log.js";

/**
 * アイテムの総件数を取得
 * @param page
 * @returns
 */
const getTotalCount = async (page: Page): Promise<number> => {
  try {
    return await page.evaluate(async () => {
      const element = document.querySelector("div.db-filter__row span.total");
      if (!element?.textContent) {
        throw new Error("total count element not found");
      }
      const total = element.textContent;
      return Number(total);
    });
  } catch (error) {
    throw error;
  }
};

/**
 * NOTE: 抽出するもの
 * - id
 * - name
 * - level: レベル
 */
const getItems = async (page: Page): Promise<Item[]> => {
  try {
    return await page.evaluate(() => {
      const elements = document.querySelectorAll("#character > tbody > tr");
      const items: Item[] = [];

      elements.forEach((element) => {
        try {
          const target = element.querySelector(
            "td.db-table__body--light > div > a",
          ) as HTMLAnchorElement | null;
          if (!target) {
            throw new Error("target element not found");
          }

          const parts = target.href.split("/");
          const id = parts[parts.length - 2];
          if (!id) {
            throw new Error("id not found");
          }

          const name = target.textContent;
          if (!name) {
            throw new Error("name not found");
          }

          const levelText = element.querySelector(
            "td.db-table__body--dark.db-table__body--center",
          )?.textContent;
          const level = Number(levelText);

          const item: Item = {
            id,
            name,
            level,
          };
          // NOTE: exposeFunctionで登録した関数を呼び出す
          // @ts-ignore
          window.stdout(item);
        } catch (error) {
          throw error;
        }
      });

      return items;
    });
  } catch (error) {
    throw error;
  }
};

export const engine = async (args: Args) => {
  const browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTION);
  const page = await browser.newPage();

  try {
    await page.exposeFunction("stdout", (item: Item) => {
      stdout(`${JSON.stringify(item)}\n`);
    });

    await page.setUserAgent(PUPPETEER_USER_AGENT);
    await page.setViewport(PUPPETEER_PAGE_VIEWPORT);

    const baseUrl = `https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/?category2=${args.page.category2}`;
    const target =
      args.page.patch === null
        ? baseUrl
        : `${baseUrl}&patch=${args.page.patch}`;

    await page.goto(target);
    await wait(500);

    const totalCount = await getTotalCount(page);
    const pageCount = calcTotalPage(totalCount);

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const pageUrl = `${target}&page=${pageNumber}`;
      try {
        await page.goto(pageUrl);
        await wait(1500);

        await getItems(page);
      } catch (error) {
        throw error;
      }
    }
  } catch (error) {
    throw error; // CI では失敗させる
  } finally {
    await browser.close();
  }
};
