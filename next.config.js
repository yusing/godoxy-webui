/** @type {import('next').NextConfig} */

const apiBaseURL =
    process.env.NODE_ENV === "development"
        ? "http://10.0.3.1:8888/v1"
        : "http://localhost:8888/v1";

console.log(apiBaseURL);

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
