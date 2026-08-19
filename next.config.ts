import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Attachments go up through a server action; the 1MB default would reject
    // anything past a screenshot. MAX_ATTACHMENT_BYTES caps a single file at 5MB.
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
