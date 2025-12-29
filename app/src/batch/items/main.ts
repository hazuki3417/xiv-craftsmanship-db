import { engine } from "./engine.js";
import { stderr } from "../../utils/log.js";

const [, , path] = process.argv;

if (!path) {
  stderr("ERROR: output path is required\n");
  stderr("Usage: node main.js <output-path>\n");
  process.exit(1);
}

(async () => {
  try {
    await engine({ path });
  } catch (error) {
    stderr(error);
    process.exit(1);
  }
})();
