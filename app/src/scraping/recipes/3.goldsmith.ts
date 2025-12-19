import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 3,
      patch: "latest",
    },
    output: "datastore/recipes/3.goldsmith.json",
  };

  await engine(args);
})();
