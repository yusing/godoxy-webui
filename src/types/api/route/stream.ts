import type { StreamEntry } from "../entry/stream";
import type { Health } from "./health";

export interface StreamRoute extends StreamEntry {
  health?: Health;
}
