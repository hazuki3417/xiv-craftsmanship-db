import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 4,
      patch: "latest",
    },
    output: "datastore/recipes/4.leatherworker.json",
  };

  await engine(args);
})();
