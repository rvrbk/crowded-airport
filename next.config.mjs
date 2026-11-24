/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: "/:path*",
                has: [{ type: "host", value: "www.crowded-airport.com" }],
                destination: "https://crowded-airport.com/:path*",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
