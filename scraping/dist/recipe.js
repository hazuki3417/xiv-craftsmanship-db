import puppeteer from 'puppeteer';
// main function
(async () => {
    const url = 'https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/04900323373/';
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    const data = await page.evaluate(async () => {
        const getRecipe = async (id) => {
            const recipe = document.querySelector("#eorzea_db > div.clearfix > div.db_cnts > div > div.recipe_detail.item_detail_box > div.db-view__item__header.clearfix > div.db-view__item__text");
            if (recipe === null) {
                throw new Error('parse error: getRecipe');
            }
            const nameElement = recipe.querySelector('h2');
            if (nameElement === null) {
                throw new Error('parse error: getRecipe');
            }
            const name = nameElement.innerText;
            const levelElement = recipe.querySelector('span[class="db-view__item__text__level__num"]');
            if (levelElement === null) {
                throw new Error('parse error: getRecipe');
            }
            const level = levelElement.innerHTML;
            const piecesElement = document.querySelector("#eorzea_db > div.clearfix > div.db_cnts > div > div.recipe_detail.item_detail_box > div.db-view__data > div.db-tree__data_header > div > p > span");
            if (piecesElement === null) {
                throw new Error('parse error: getRecipe');
            }
            const pieces = piecesElement.innerHTML;
            return {
                id: id,
                name: name,
                level: parseInt(level, 10),
                pieces: parseInt(pieces, 10),
                materials: await getMaterials(),
                crystals: await getCrystals()
            };
        };
        const getMaterials = async () => {
            const elements = document.querySelectorAll("#eorzea_db > div.clearfix > div.db_cnts > div > div.recipe_detail.item_detail_box > div.db-view__data > div:nth-child(3) > div > div.js__material");
            const materials = [];
            elements.forEach((element) => {
                const id = element.getAttribute('data-key');
                const name = element.getAttribute('data-name');
                const quantity = element.getAttribute('data-num');
                if (id === null || name === null || quantity === null) {
                    throw new Error('parse error: getMaterials');
                }
                materials.push({
                    id: id,
                    name: name,
                    quantity: parseInt(quantity, 10)
                });
            });
            return materials;
        };
        const getCrystals = async () => {
            const elements = document.querySelectorAll("#eorzea_db > div.clearfix > div.db_cnts > div > div.recipe_detail.item_detail_box > div.db-view__data > div:nth-child(4) > div > div.js__material");
            const crystals = [];
            elements.forEach((element) => {
                const id = element.getAttribute('data-key');
                const name = element.getAttribute('data-name');
                const quantity = element.getAttribute('data-num');
                if (id === null || name === null || quantity === null) {
                    throw new Error('parse error: getCrystals');
                }
                crystals.push({
                    id: id,
                    name: name,
                    quantity: parseInt(quantity, 10)
                });
            });
            return crystals;
        };
        const recipe = await getRecipe('04900323373');
        return recipe;
    });
    console.log(data);
    await browser.close();
})();
