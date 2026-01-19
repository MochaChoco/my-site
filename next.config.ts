import type { NextConfig } from "next";

const isExport =
  process.env.NEXT_PUBLIC_EXPORT === "true" ||
  process.env.GITHUB_PAGES === "true" ||
  process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  basePath: isExport ? "/blog" : "",
  assetPrefix: isExport ? "/blog" : "",
  trailingSlash: isExport,
  images: {
    unoptimized: isExport,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isExport ? "/blog" : "",
  },
};

export default nextConfig;
