/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },

  // ---------------------------------------------------------------------------
  // API Proxy Rewrites — eliminates CORS permanently.
  // Browser calls /api/v1/... (same origin) → Next.js server forwards to Render.
  // Server-to-server has no CORS restrictions, so this works from any deployment.
  // ---------------------------------------------------------------------------
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
