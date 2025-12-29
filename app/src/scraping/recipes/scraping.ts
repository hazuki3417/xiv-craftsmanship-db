import puppeteer, { Page } from "puppeteer-core";
import { Args } from "./types.js";
import {
  PUPPETEER_LAUNCH_OPTION,
  PUPPETEER_PAGE_VIEWPORT,
  PUPPETEER_USER_AGENT,
} from "./../../constants.js";
import { calcTotalPage, stdout, wait } from "./../../utils/index.js";
import {
  type Recipe,
  type Material,
  type Crystal,
} from "./../../types/index.js";

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

const getRecipLinks = async (page: Page): Promise<string[]> => {
  try {
    return await page.evaluate(async () => {
      const elements = document.querySelectorAll("#character > tbody > tr");

      const links: string[] = [];
      elements.forEach((element) => {
        const href = element
          ?.querySelector(
            "td.db-table__body--light.latest_patch__major__item > div.db-table__link_txt > a",
          )
          ?.getAttribute("href");
        if (!href) {
          throw new Error("parse error: getRecipLinks");
        }
        links.push(href);
      });
      return links;
    });
  } catch (error) {
    throw error;
  }
};

const getMaterials = async (page: Page): Promise<Material[]> => {
  try {
    return await page.evaluate(async () => {
      const elements = document.querySelectorAll(
        "#eorzea_db > div.clearfix > div.db_cnts > div > div.recipe_detail.item_detail_box > div.db-view__data > div:nth-child(3) > div > div.js__material",
      );
      const materials: Material[] = [];

      elements.forEach((element) => {
        const id = element.getAttribute("data-key");
        const name = element.getAttribute("data-name");
        const quantity = element.getAttribute("data-num");

        if (id === null || name === null || quantity === null) {
          throw new Error("parse error: getMaterials");
        }

        materials.push({
          id: id,
          name: name,
          quantity: parseInt(quantity, 10),
        });
      });

      return materials;
    });
  } catch (error) {
    throw error;
  }
};

const getCrystals = async (page: Page): Promise<Crystal[]> => {
  try {
    return await page.evaluate(async () => {
      const elements = document.querySelectorAll(
        "#eorzea_db > div.clearfix > div.db_cnts > div > div.recipe_detail.item_detail_box > div.db-view__data > div:nth-child(4) > div > div.js__material",
      );
      const crystals: Crystal[] = [];

      elements.forEach((element) => {
        const id = element.getAttribute("data-key");
        const name = element.getAttribute("data-name");
        const quantity = element.getAttribute("data-num");

        if (id === null || name === null || quantity === null) {
          throw new Error("parse error: getCrystals");
        }

        crystals.push({
          id: id,
          name: name,
          quantity: parseInt(quantity, 10),
        });
      });

      return crystals;
    });
  } catch (error) {
    throw error;
  }
};

const getRecipe = async (page: Page): Promise<Recipe> => {
  try {
    return await page.evaluate(async () => {
      const recipe = document.querySelector(
        "#eorzea_db > div.clearfix > div.db_cnts > div > div.recipe_detail.item_detail_box > div.db-view__item__header.clearfix > div.db-view__item__text",
      );

      if (recipe === null) {
        throw new Error("parse error: getRecipe");
      }

      const nameElement = recipe.querySelector("h2");
      if (nameElement === null) {
        throw new Error("parse error: getRecipe");
      }
      const name = nameElement.innerText;

      const levelElement = recipe.querySelector(
        'span[class="db-view__item__text__level__num"]',
      );
      if (levelElement === null) {
        throw new Error("parse error: getRecipe");
      }
      const level = levelElement.innerHTML;

      const piecesElement = document.querySelector(
        "#eorzea_db > div.clearfix > div.db_cnts > div > div.recipe_detail.item_detail_box > div.db-view__data > div.db-tree__data_header > div > p > span",
      );

      if (piecesElement === null) {
        throw new Error("parse error: getRecipe");
      }

      const pieces = piecesElement.innerHTML;

      return {
        id: "",
        name: name,
        level: parseInt(level, 10),
        pieces: parseInt(pieces, 10),
        materials: [],
        crystals: [],
      };
    });
  } catch (error) {
    throw error;
  }
};

export const engine = async (args: Args) => {
  const browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTION);
  const page = await browser.newPage();

  try {
    await page.setUserAgent(PUPPETEER_USER_AGENT);
    await page.setViewport(PUPPETEER_PAGE_VIEWPORT);

    const baseUrl = `https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/?category2=${args.page.category2}`;
    const target =
      args.page.patch === undefined
        ? baseUrl
        : `${baseUrl}&patch=${args.page.patch}`;

    await page.goto(target);
    await wait(500);

    const totalCount = await getTotalCount(page);
    const pageCount = calcTotalPage(totalCount);

    let links: string[] = [];

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const pageUrl = `${target}&page=${pageNumber}`;
      try {
        await page.goto(pageUrl);
        await wait(1500);

        const currentRecipeLinks = await getRecipLinks(page);
        links = [...links, ...currentRecipeLinks];
      } catch (error) {
        throw error;
      }
    }

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const url = `https://jp.finalfantasyxiv.com${link}`;
      await page.goto(url);
      await wait(1500);

      const materials = await getMaterials(page);
      const crystals = await getCrystals(page);
      const recipe = await getRecipe(page);

      // NOTE: {id}部分を抽出する
      // 例: /lodestone/playguide/db/item/{id}/
      const parts = link.split("/");
      const id = parts[parts.length - 2];

      recipe.id = id;
      recipe.materials = materials;
      recipe.crystals = crystals;

      stdout(`${JSON.stringify(recipe)}\n`);
    }
  } catch (error) {
    throw error; // CI では失敗させる
  } finally {
    await browser.close();
  }
};
