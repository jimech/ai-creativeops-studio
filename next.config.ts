import type { NextConfig } from "next";

function getSecurityHeaders() {
  const headers = [
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];

  if (process.env.NODE_ENV === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  // CSP deferred: Google OAuth, Stripe Checkout, and Next.js runtime assets need
  // careful allowlists. Add a nonce-based CSP in a follow-up hardening ticket.

  return headers;
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: getSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
