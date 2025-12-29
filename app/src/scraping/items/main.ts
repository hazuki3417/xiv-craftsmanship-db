import { Args } from "./types.js";
import { engine } from "./scraping.js";
import { stderr } from "../../utils/index.js";
import { ItemCategory2 } from "../../types/index.js";
import { MAP_ITEM_CATEGORY2 } from "../../constants.js";

const [, , type, patch] = process.argv;

if (!type) {
  stderr("ERROR: output type is required\n");
  stderr("Usage: node main.js <type>\n");
  process.exit(1);
}

if (!patch) {
  stderr("ERROR: output patch is required\n");
  stderr("Usage: node main.js <patch>\n");
  process.exit(1);
}

(async () => {
  if (!Object.hasOwn(MAP_ITEM_CATEGORY2, type)) {
    stderr(`ERROR: invalid type "${type}"\n`);
    process.exit(1);
  }
  const category2 = MAP_ITEM_CATEGORY2[type as ItemCategory2];
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
