import type { NextConfig } from "next";

const isExport = process.env.NEXT_PUBLIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  basePath: isExport ? "/my-site" : "",
  assetPrefix: isExport ? "/my-site" : "",
  trailingSlash: isExport,
  images: {
    unoptimized: isExport,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isExport ? "/my-site" : "",
  },
};

export default nextConfig;
