import { createStore } from "juststore";
import assert from "assert";

const store = createStore("test", { health: { "a.b": { status: "ok" } } });
assert.strictEqual(store.state(["health", "a.b", "status"]).value, "ok");
