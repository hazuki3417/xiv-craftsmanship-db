import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 0,
      patch: "latest",
    },
    output: "datastore/recipes/0.carpenter.json",
  };

  await engine(args);
})();
