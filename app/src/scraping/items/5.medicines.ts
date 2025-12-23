import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 5,
      patch: "latest",
    },
    item: { category1: "薬品・調理品" },
    output: "./datastore/items/5.medicines.json",
  };

  await engine(args);
})();
