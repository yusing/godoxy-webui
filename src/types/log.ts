// logger.js
import log from "loglevel";

const logLevel = process.env.NODE_ENV === "production" ? "warn" : "debug";

log.setLevel(logLevel);

export default log;
