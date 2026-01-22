import { getAllPosts, getPostBySlug, getPostAdjacent, getRelatedPosts } from "@/lib/posts";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { rehypeBasePath } from "@/lib/rehype-base-path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { cn, formatDate } from "@/lib/utils";
import { withBasePath } from "@/lib/base-path";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { isValidElement } from "react";
import { PostNavigation } from "@/components/post-navigation";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ShareButtons } from "@/components/share-buttons";
import { RelatedPosts } from "@/components/related-posts";
import { extractToc, createHeadingSlugger } from "@/lib/toc";
import { MobileToc, TableOfContents } from "@/components/table-of-contents";

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

const getNodeText = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }
  if (isValidElement(node)) {
    const { children } = node.props as { children?: ReactNode };
    return getNodeText(children);
  }
  return "";
};

const createHeading =
  (slugger: ReturnType<typeof createHeadingSlugger>, Tag: "h2" | "h3" | "h4") =>
  ({ children, className, ...props }: ComponentPropsWithoutRef<typeof Tag>) => {
    const text = getNodeText(children);
    const id = slugger(text);

    return (
      <Tag id={id} className={cn("scroll-mt-24", className)} {...props}>
        {children}
      </Tag>
    );
  };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const { prev, next } = await getPostAdjacent(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(slug, post.frontmatter.tags);
  const postUrl = buildUrl(`/posts/${post.slug}`);
  const tocItems = extractToc(post.content);
  const hasToc = tocItems.length > 0;
  const headingSlugger = createHeadingSlugger();
  const components = {
    // Simple Override for Pre to include Copy Button
    pre: ({ children, className, ...props }: ComponentPropsWithoutRef<"pre">) => (
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
    img: ({ src, alt, ...props }: ComponentPropsWithoutRef<"img">) => {
      const imageSrc = typeof src === "string" ? withBasePath(src) : src;
      return <img src={imageSrc} alt={alt || ""} {...props} />;
    },
    // Open MDX links in a new tab by default (except in-page anchors like #section).
    a: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => {
      const resolvedHref =
        typeof href === "string" ? withBasePath(href) : href;
      const shouldOpenInNewTab =
        typeof resolvedHref === "string" && !resolvedHref.startsWith("#");
      const target =
        props.target ?? (shouldOpenInNewTab ? "_blank" : undefined);
      const rel =
        target === "_blank" ? (props.rel ?? "noopener noreferrer") : props.rel;

      return (
        <a href={resolvedHref} target={target} rel={rel} {...props}>
          {children}
        </a>
      );
    },
    h2: createHeading(headingSlugger, "h2"),
    h3: createHeading(headingSlugger, "h3"),
    h4: createHeading(headingSlugger, "h4"),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <article
        className={cn(
          "grid grid-cols-1 gap-10",
          hasToc && "lg:grid-cols-[minmax(0,1fr)_220px]"
        )}
      >
        <div>
          <div className="space-y-4 mb-10 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {post.frontmatter.title}
            </h1>
            <time className="block text-muted-foreground">
              {formatDate(post.frontmatter.date)}
            </time>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
              {post.frontmatter.tags?.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="bg-secondary px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <ShareButtons title={post.frontmatter.title} url={postUrl} />
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
                    rehypeBasePath,
                  ],
                },
              }}
            />
          </div>
          <PostNavigation prev={prev} next={next} />
          <RelatedPosts posts={relatedPosts} />
          <ScrollToTop />
        </div>
        {hasToc && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents items={tocItems} />
            </div>
          </aside>
        )}
      </article>
      {hasToc && <MobileToc items={tocItems} />}
    </div>
  );
}
