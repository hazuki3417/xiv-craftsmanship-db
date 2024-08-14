import { promises as fs } from 'fs';
import path from 'path';
import pkg from 'pg';

const { Pool } = pkg
// import { Pool } from 'pg';

// データベース接続設定
const postgresql = new Pool({
  user: 'example',
  host: 'localhost',
  database: 'example',
  password: 'example',
  port: 5432,
});

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

const createRecipeData = async (recipe: Recipe) => {
const client = await postgresql.connect(); // クライアントを取得

  try {
    await client.query('BEGIN'); // トランザクションを開始


    const target = (await postgresql.query<{id: string, name: string, level: number}>(
      'SELECT * FROM items WHERE name = $1',
       [recipe.name])).rows[0]

    const job = '木工師'
    await client.query(
      `INSERT INTO public.recipes(id, item_id, "level", pieces, job)VALUES($1, $2, $3, $4, $5);`,
       [recipe.id, target.id, recipe.level, recipe.pieces, job]
      );


    await recipe.crystals.forEach(async (crystal) => {
      await client.query(
        `INSERT INTO public.item_tree(parent_item_id, child_item_id, quantity, "type")VALUES($1, $2, $3, $4);`,
        [target.id,crystal.id, crystal.quantity,"crystal"]
      )
    })

    await recipe.materials.forEach(async (material) => {
      await client.query(
        `INSERT INTO public.item_tree(parent_item_id, child_item_id, quantity, "type")VALUES($1, $2, $3, $4);`,
        [target.id,material.id, material.quantity,"material"]
      )
    })

    await client.query('COMMIT'); // トランザクションをコミット
    console.log('Users created successfully.');
  } catch (error) {
    await client.query('ROLLBACK'); // エラーが発生した場合はロールバック
    console.error('Error creating users:', error);
    throw error;
  } finally {
    client.release(); // クライアントを解放
  }
}



(async() => {
  try {
    // scraping/datastore/recipes/0.carpenter/1.json
    // scraping/dist/batch/recipes/0.carpenter.ts
    const jsonFilePath = path.join('datastore/recipes/0.carpenter/', 'recipes.json');

    const data = await fs.readFile(jsonFilePath, 'utf8');
    const recipes = JSON.parse(data) as Recipe[];

    for (let i = 0; i < recipes.length; i++){
      await new Promise((resolve) => setTimeout(resolve, 500));
      createRecipeData(recipes[i]).then(() => {
        console.log("success: ", recipes[i].id)
      }).catch((err) => {
          console.error("error", err)
          console.error("index", i)
      })
    }

  } catch (error) {
    console.error("error", error)
  }
})();
