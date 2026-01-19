import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import { withBasePath } from "@/lib/base-path";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

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

const toAbsoluteUrl = (pathOrUrl: string) => {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const withLeadingSlash = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;
  return buildUrl(withLeadingSlash);
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const title = post.frontmatter.title;
  const description = post.frontmatter.description;
  const tags = post.frontmatter.tags || [];
  const url = buildUrl(`/posts/${post.slug}`);
  const image = post.frontmatter.coverImage
    ? toAbsoluteUrl(post.frontmatter.coverImage)
    : undefined;
  return {
    metadataBase: new URL(buildUrl("/")),
    title,
    description,
    keywords: tags,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: "ko_KR",
      publishedTime: post.frontmatter.date,
      tags,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

const components = {
  // Simple Override for Pre to include Copy Button
  pre: ({ children, className, ...props }: any) => (
    <div className="relative group">
      <pre
        className={cn(
          "overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 p-4 my-4 text-xs leading-6 sm:text-sm",
          className
        )}
        {...props}
      >
        {children}
      </pre>
      <CopyButton
        text=""
        className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  ),
  // Override img to handle basePath for static exports
  img: ({ src, alt, ...props }: any) => {
    const imageSrc = src ? withBasePath(src) : src;
    return <img src={imageSrc} alt={alt || ""} {...props} />;
  },
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl py-8 sm:py-10">
      <div className="space-y-4 mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          {post.frontmatter.title}
        </h1>
        <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
          {post.frontmatter.tags?.map((tag) => (
            <span key={tag} className="bg-secondary px-2 py-1 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-blue-600 dark:prose-a:text-blue-400 dark:prose-invert sm:prose-base">
        <MDXRemote
          source={post.content}
          components={components}
          options={{
            mdxOptions: {
              rehypePlugins: [
                [
                  rehypePrettyCode,
                  {
                    theme: "one-dark-pro",
                    keepBackground: true,
                  },
                ],
              ],
            },
          }}
        />
      </div>
    </article>
  );
}
