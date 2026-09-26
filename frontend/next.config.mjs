/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },

  // ---------------------------------------------------------------------------
  // API Rewrites — Fallback architecture:
  // Next.js internal route handlers (src/app/api/v1/...) are checked first.
  // When NEXT_PUBLIC_API_URL is configured (e.g. Render live backend), fallback proxy handles it.
  // ---------------------------------------------------------------------------
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl && !backendUrl.includes("localhost") && !backendUrl.includes("127.0.0.1")) {
      return {
        fallback: [
          {
            source: "/api/v1/:path*",
            destination: `${backendUrl}/api/v1/:path*`,
          },
        ],
      };
    }
    if (process.env.NODE_ENV !== "production") {
      return {
        fallback: [
          {
            source: "/api/v1/:path*",
            destination: "http://127.0.0.1:8000/api/v1/:path*",
          },
        ],
      };
    }
    return [];
  },
};

export default nextConfig;
