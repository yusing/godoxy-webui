/** @type {import('next').NextConfig} */

const apiBaseURL = process.env.API_BASE_URL ||
    process.env.NODE_ENV === 'development' ? 'http://10.0.1.8:8888/v1' : 'http://localhost:8888/v1';
console.log(`apiBaseURL: ${apiBaseURL}`);

const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${apiBaseURL}/:path*`, // Proxy to Backend apiBaseURL,
            },
        ]
    }
}

module.exports = nextConfig
