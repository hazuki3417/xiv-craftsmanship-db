import { engine } from "./engine.js";

(async () => {
  await engine("/app/datastore/items/5.medicines.json");
})();
