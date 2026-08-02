import { createStore } from "juststore";
const store = createStore("test", { health: { "a.b": { status: "ok" } } });
try {
  console.log("Array path:", store.state(["health", "a.b", "status"]).value);
} catch (e) {
  console.log("Array path error:", e.message);
}
