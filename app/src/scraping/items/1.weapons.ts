import { Args } from "./types.js";
import { engine } from "./scraping.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 1,
      patch: "latest",
    },
    item: { category1: "武器" },
  };

  await engine(args);
})();
