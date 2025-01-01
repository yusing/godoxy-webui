/** @type {import('next').NextConfig} */

const envPrefixes = ["GODOXY_", "GOPROXY_", ""];
let apiAddr;

for (const prefix of envPrefixes) {
  apiAddr = process.env[`${prefix}API_ADDR`];
  if (apiAddr !== undefined) {
    break;
  }
}

const apiBaseURL =
  apiAddr === undefined
    ? "http://127.0.0.1:8888/v1"
    : `http://${apiAddr}/v1`;

const nextConfig = {
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseURL}/:path*`, // Proxy to Backend apiBaseURL,
      },
    ];
  },
};

module.exports = nextConfig;
