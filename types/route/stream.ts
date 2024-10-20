import { StreamEntry } from "../entry/stream";

import { Health } from "./health";

export interface StreamRoute extends StreamEntry {
  health?: Health;
}
