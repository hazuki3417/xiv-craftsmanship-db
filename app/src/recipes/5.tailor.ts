import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 5,
      patch: "latest",
    },
    output: "datastore/recipes/5.tailor.json",
  };

  await engine(args);
})();
