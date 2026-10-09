import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  // Development logs must not print credentials, form arguments or callback tokens.
  logging: { serverFunctions: false, incomingRequests: false, browserToTerminal: false },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Referrer-Policy", value: "same-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};
export default config;
