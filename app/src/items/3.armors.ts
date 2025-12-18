import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 3,
      patch: "latest",
    },
    item: { category1: "防具" },
    output: "datastore/items/3.armors.json",
  };

  await engine(args);
})();
