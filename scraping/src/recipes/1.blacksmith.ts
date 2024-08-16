import puppeteer, { Page } from "puppeteer";
import { writeFile } from "fs/promises";

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
const getRecipLinks = async (page: Page): Promise<string[]> => {
	return await page.evaluate(async () => {
		const elements = document.querySelectorAll("#character > tbody > tr");

		const links: string[] = [];

		elements.forEach((element) => {
			const href = element
				.querySelector(
					"td.db-table__body--light.latest_patch__major__item > div.db-table__link_txt > a",
				)
				.getAttribute("href");
			links.push(href);
		});
		return links;
	});
};

type Recipe = {
	id: string;
	name: string;
	level: number;
	pieces: number; // 完成個数
	materials: Material[];
	crystals: Crystal[];
};

type Material = {
	id: string;
	name: string;
	quantity: number;
};

type Crystal = {
	id: string;
	name: string;
	quantity: number;
};

const getMaterials = async (page: Page): Promise<Material[]> => {
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
};

const getCrystals = async (page: Page): Promise<Crystal[]> => {
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
};

const getRecipe = async (page: Page): Promise<Recipe> => {
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
};

const writeJsonToFile = async (
	filePath: string,
	jsonObject: object,
): Promise<void> => {
	try {
		// JSONオブジェクトを文字列に変換
		const jsonString = JSON.stringify(jsonObject, null, 2);

		// ファイルに書き込む
		await writeFile(filePath, jsonString, "utf8");

		console.log("File written successfully");
	} catch (error) {
		console.error("Error writing file:", error);
	}
};

// main function
(async () => {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setViewport({ width: 1080, height: 1024 });

	let recipeLinks: string[] = [];
	let pageNumber = 3;
	const limit = 34;
	// const limit = 1;
	const category2 = 1;

	// recipeのリンクを収集
	for (; pageNumber <= limit; pageNumber++) {
		const url = `https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/?category2=${category2}&page=${pageNumber}`;
		await page.goto(url, {timeout: 60000});
		await new Promise((resolve) => setTimeout(resolve, 3000));

		const currentRecipeLinks = await getRecipLinks(page);
		recipeLinks = [...recipeLinks, ...currentRecipeLinks];
	}

	// console.log(recipeLinks);

	let recipes: Recipe[] = [];
	for (let i = 0; i < recipeLinks.length; i++) {
		const link = recipeLinks[i];
		const url = `https://jp.finalfantasyxiv.com${link}`;
		await page.goto(url, {timeout: 60000});
		await new Promise((resolve) => setTimeout(resolve, 3000));

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

		recipes.push(recipe);
		console.log(id);
	}

	await writeJsonToFile("datastore/recipes/1.blacksmith/recipes.json", recipes);

	await browser.close();
})();
