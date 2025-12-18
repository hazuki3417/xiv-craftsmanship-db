import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 2,
      patch: "latest",
    },
    output: "datastore/recipes/2.armorer.json",
  };

  await engine(args);
})();
