import { getAllPosts } from "@/lib/posts";
import { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://mochachoco.github.io/blog";

const normalizeBasePath = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/|\/$/g, "")}`;
};

const siteUrl = new URL(SITE_URL);
const siteBasePath = normalizeBasePath(siteUrl.pathname);
const siteOrigin = siteUrl.origin;

const buildUrl = (pathname: string) => {
  const normalizedPath = `${siteBasePath}${pathname}`.replace(/\/{2,}/g, "/");
  return new URL(normalizedPath, siteOrigin).toString();
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const postsUrls = posts.map((post) => ({
    url: buildUrl(`/posts/${post.slug}`),
    lastModified: new Date(post.frontmatter.date),
  }));

  return [
    {
      url: buildUrl("/"),
      lastModified: new Date(),
    },
    {
      url: buildUrl("/posts"),
      lastModified: new Date(),
    },
    {
      url: buildUrl("/tags"),
      lastModified: new Date(),
    },
    ...postsUrls,
  ];
}
