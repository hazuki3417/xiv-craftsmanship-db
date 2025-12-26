import { engine } from "./engine.js";
import { stderr } from "../../utils/log.js";

const [, , outputPath] = process.argv;

if (!outputPath) {
  stderr("ERROR: output path is required\n");
  stderr("Usage: node main.js <output-path>\n");
  process.exit(1);
}

(async () => {
  await engine(outputPath);
})();
