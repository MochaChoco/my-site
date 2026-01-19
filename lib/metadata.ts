import type { Metadata } from "next";

const SITE_URL = "https://mochachoco.github.io/blog";

const DEFAULT_TITLE = "DevBlog";
const DEFAULT_DESCRIPTION = "웹 개발자의 기술블로그입니다.";
const DEFAULT_KEYWORDS = [
  "웹 개발",
  "프론트엔드",
  "백엔드",
  "기술 블로그",
  "dev",
];
const DEFAULT_IMAGE = "/images/og-image.png";

const siteUrl = new URL(SITE_URL);
const siteOrigin = siteUrl.origin;
const siteBasePath = siteUrl.pathname.replace(/\/$/, "");

const buildUrl = (pathname: string) => {
  const normalizedPath = `${siteBasePath}${pathname}`.replace(/\/{2,}/g, "/");
  return new URL(normalizedPath, siteOrigin).toString();
};

const toAbsoluteUrl = (pathOrUrl: string) => {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const withLeadingSlash = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;
  return buildUrl(withLeadingSlash);
};

export const buildPageMetadata = (pathname: string): Metadata => {
  const url = buildUrl(pathname);
  const image = toAbsoluteUrl(DEFAULT_IMAGE);

  return {
    metadataBase: new URL(buildUrl("/")),
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      url,
      type: "website",
      locale: "ko_KR",
      images: [{ url: image, alt: DEFAULT_TITLE }],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [image],
    },
  };
};
