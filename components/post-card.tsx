import Link from "next/link";
import Image from "next/image";
import { PostMeta } from "@/lib/posts";
import { withBasePath } from "@/lib/base-path";
import { formatDate } from "@/lib/utils";

export function PostCard({ post }: { post: PostMeta }) {
  const defaultCover = withBasePath("/images/default-blog-cover.png");
  const coverImage = post.frontmatter.coverImage
    ? withBasePath(post.frontmatter.coverImage)
    : defaultCover;

  return (
    <Link href={`/posts/${post.slug}`}>
      <article className="group relative flex flex-col items-center gap-4 cursor-pointer transition-transform hover:scale-[1.02] sm:flex-row">
        <div className="relative h-48 w-full overflow-hidden rounded-lg sm:h-40 sm:w-60 sm:flex-shrink-0">
          <Image
            src={coverImage}
            alt={post.frontmatter.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col space-y-2 flex-1">
          <time className="text-sm text-muted-foreground">
            {formatDate(post.frontmatter.date)}
          </time>
          <h2 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors sm:text-2xl">
            {post.frontmatter.title}
          </h2>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {post.frontmatter.tags?.map((tag) => (
              <span key={tag} className="bg-secondary px-2 py-1 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3 sm:text-base">
            {post.frontmatter.description}
          </p>
        </div>
      </article>
    </Link>
  );
}
