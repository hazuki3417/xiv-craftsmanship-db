import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 4,
      patch: "latest",
    },
    item: { category1: "アクセサリ" },
    output: "datastore/items/4.accessorys.json",
  };

  await engine(args);
})();
