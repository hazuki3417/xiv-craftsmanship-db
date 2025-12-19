import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 7,
      patch: "latest",
    },
    output: "datastore/recipes/7.cook.json",
  };

  await engine(args);
})();
