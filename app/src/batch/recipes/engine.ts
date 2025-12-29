import { postgresql, stderr, stdout, wait } from "../../utils/index.js";
import { type Recipe } from "../../types/index.js";
import { createRecipeData } from "./query.js";
import fs from "fs";
import readline from "readline";

export interface EngineArgs {
  path: string;
  option: {
    job: string;
  };
}

export const engine = async (args: EngineArgs) => {
  const { path, option } = args;
  const client = await postgresql.connect();
  try {
    const stream = fs.createReadStream(path, "utf8");
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (!line.trim()) continue;
      const recipe = JSON.parse(line) as Recipe; // ← 1 行 = 1 JSON
      await createRecipeData({ client, recipe, option });
      stdout(`success: ${JSON.stringify(recipe)}\n`);
    }
  } catch (error) {
    await client.query("ROLLBACK"); // エラーが発生した場合はロールバック
    throw error;
  } finally {
    client.release(); // クライアントを解放
  }
};
