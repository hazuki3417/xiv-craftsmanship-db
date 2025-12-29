import { engine } from "./engine.js";
import { stderr } from "../../utils/index.js";

const [, , path, job] = process.argv;

if (!path) {
  stderr("ERROR: output path is required\n");
  stderr("Usage: node main.js <output-path>\n");
  process.exit(1);
}

if (!job) {
  stderr("ERROR: output job is required\n");
  stderr("Usage: node main.js <output-job>\n");
  process.exit(1);
}

(async () => {
  try {
    await engine({ path, option: { job } });
  } catch (error) {
    stderr(error);
    process.exit(1);
  }
})();
