/* eslint-disable @typescript-eslint/no-explicit-any */

const level = process.env.NODE_ENV === "production" ? "info" : "debug";

const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

class Logger {
  level: keyof typeof LEVELS;

  constructor(level: keyof typeof LEVELS) {
    this.level = level;
  }

  debug(message: string, ...args: any[]) {
    if (LEVELS[this.level] <= LEVELS.debug) {
      console.log(message, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (LEVELS[this.level] <= LEVELS.info) {
      console.log(message, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (LEVELS[this.level] <= LEVELS.warn) {
      console.log(message, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (LEVELS[this.level] <= LEVELS.error) {
      console.error(message, ...args);
    }
  }
}

export const logger = new Logger(level);
