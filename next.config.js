/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // GitHub Pages usually requires a basePath if it's a project repository (e.g., /my-repo)
  // Update this to '/your-repo-name' if deploying to a project page.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for next export
  },
};

module.exports = nextConfig;
