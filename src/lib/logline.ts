export type LogLine = {
  time: string;
  content: string;
};

// 2025-02-19T17:06:57.726414698Z [xxx] 2025/02/19 17:06:57 xxxx
export const parseLogLine = (line: string): LogLine => {
  const [timestamp, ...content] = line.split(" ");
  const date = new Date(timestamp!);
  return {
    time: date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    content: content
      .join(" ")
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.,]\d*)?Z/, "")
      .replace(
        /(?:\u001b\[\d{2}m)?(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})[,\s]*/,
        "",
      )
      .replace(
        /(?:\d{1,2}:\d{1,2}(?::\d{1,2})?\s*(?:[ap]m)?(?:\u001b\[32m)?)(?:[.,]\d*)?/i,
        "",
      )
      .split(" ")
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .join(" "),
  };
};
