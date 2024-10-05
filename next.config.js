/** @type {import('next').NextConfig} */

const apiBaseURL =
  process.env.GOPROXY_API_ADDR === undefined
    ? "http://127.0.0.1:8888/v1"
    : `http://${process.env.GOPROXY_API_ADDR}/v1`;

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
