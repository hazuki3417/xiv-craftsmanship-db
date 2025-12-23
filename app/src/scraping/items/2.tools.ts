import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 2,
      patch: "latest",
    },
    item: { category1: "道具" },
    output: "/app/datastore/items/2.tools.json",
  };

  await engine(args);
})();
