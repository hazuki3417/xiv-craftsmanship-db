import { Args } from "./types.js";
import { engine } from "./scraping.js";
import { stderr } from "../../utils/index.js";
import { RecipeCategory2 } from "../../types/index.js";
import { MAP_RECIPE_CATEGORY2 } from "../../constants.js";

const [, , job, patch] = process.argv;

if (!job) {
  stderr("ERROR: job is required\n");
  stderr("Usage: node main.js <job>\n");
  process.exit(1);
}

if (!patch) {
  stderr("ERROR: patch is required\n");
  stderr("Usage: node main.js <patch>\n");
  process.exit(1);
}

(async () => {
  if (!Object.hasOwn(MAP_RECIPE_CATEGORY2, job)) {
    stderr(`ERROR: invalid job "${job}"\n`);
    process.exit(1);
  }
  const category2 = MAP_RECIPE_CATEGORY2[job as RecipeCategory2];
  const args: Args = {
    page: {
      category2: category2.id,
      patch: patch === "null" ? null : patch,
    },
  };

  try {
    await engine(args);
  } catch (error) {
    stderr(error);
    process.exit(1);
  }
})();
