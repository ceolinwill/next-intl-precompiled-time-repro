import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  experimental: {
    messages: {
      format: "json",
      locales: "infer",
      path: "./messages",
      precompile: process.env.PRECOMPILE !== "0",
    },
  },
});

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
