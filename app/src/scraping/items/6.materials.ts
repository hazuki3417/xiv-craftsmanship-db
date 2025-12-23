import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 6,
      patch: "latest",
    },
    item: { category1: "素材" },
    output: "/app/datastore/items/6.materials.json",
  };

  await engine(args);
})();
