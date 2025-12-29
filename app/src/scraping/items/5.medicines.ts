import { Args } from "./types.js";
import { engine } from "./scraping.js";
import { stderr } from "../../utils/index.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 5,
      patch: "7.1",
    },
    item: { category1: "薬品・調理品" },
  };

  try {
    await engine(args);
  } catch (error) {
    stderr(error);
    process.exit(1);
  }
})();
