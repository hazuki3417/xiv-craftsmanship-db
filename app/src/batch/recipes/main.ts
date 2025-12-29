import { engine } from "./engine.js";
import { stderr } from "../../utils/index.js";
import { MAP_RECIPE_CATEGORY2 } from "../../constants.js";
import { RecipeCategory2 } from "../../types/index.js";

const [, , path, job] = process.argv;

if (!path) {
  stderr("ERROR: path is required\n");
  stderr("Usage: node main.js <path>\n");
  process.exit(1);
}

if (!job) {
  stderr("ERROR: job is required\n");
  stderr("Usage: node main.js <job>\n");
  process.exit(1);
}

(async () => {
  if (!Object.hasOwn(MAP_RECIPE_CATEGORY2, job)) {
    stderr(`ERROR: invalid job "${job}"\n`);
    process.exit(1);
  }

  try {
    const category2 = MAP_RECIPE_CATEGORY2[job as RecipeCategory2];
    await engine({ path, option: { job: category2.label } });
  } catch (error) {
    stderr(error);
    process.exit(1);
  }
})();
