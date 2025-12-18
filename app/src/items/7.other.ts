import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 7,
      patch: "latest",
    },
    item: { category1: "その他" },
    output: "datastore/items/7.other.json",
  };

  await engine(args);
})();
