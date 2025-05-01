import { EntrypointMiddlewares } from "../middlewares/middleware_compose";
import { RequestLogConfig } from "./access_log";

export type EntrypointConfig = {
  /** Entrypoint middleware configuration */
  middlewares?: EntrypointMiddlewares;
  /** Entrypoint access log configuration */
  access_log?: RequestLogConfig;
};
