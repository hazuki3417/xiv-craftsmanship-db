import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 1,
      limit: 2,
      // limit: 113,
    },
    item: { category1: "武器" },
    output: "datastore/items/1.weapons.json",
  };

  await engine(args);
})();
