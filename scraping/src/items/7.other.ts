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

type Item = {
	id: string;
	name: string;
	category1: string;
	category2: string;
	level: number;
};

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
				category1: "その他",
				category2: category2,
				level: parseInt(level),
			});
		});

		return Items;
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

	let items: Item[] = [];
	const limit = 1; // 2ページ以降は排出停止アイテムなので取得しない
	for (let pageNumber = 1; pageNumber <= limit; pageNumber++) {
		const url = `https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/?category2=7&page=${pageNumber}`;
		await page.goto(url);
		await new Promise((resolve) => setTimeout(resolve, 5000));
		const currentItems = await getItems(page);
		console.log(pageNumber);
		items = [...items, ...currentItems];
	}

	await writeJsonToFile("datastore/items/7.other.json", items);

	await browser.close();
})();
