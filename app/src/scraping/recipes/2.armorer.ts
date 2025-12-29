import { Args } from "./types.js";
import { engine } from "./scraping.js";
import { stderr } from "../../utils/index.js";

// main function
(async () => {
  const args: Args = {
    page: {
      category2: 2,
      patch: "latest",
    },
  };

  try {
    await engine(args);
  } catch (error) {
    stderr(error);
    process.exit(1);
  }
})();
