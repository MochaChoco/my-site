import Link from "next/link";
import Image from "next/image";
import { PostMeta } from "@/lib/posts";
import { withBasePath } from "@/lib/base-path";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PostNavigationProps {
  prev: PostMeta | null;
  next: PostMeta | null;
}

export function PostNavigation({ prev, next }: PostNavigationProps) {
  return (
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t">
      {prev ? (
        <NavButton post={prev} direction="prev" />
      ) : (
        <div /> /* Empty spacer for grid alignment */
      )}
      {next && <NavButton post={next} direction="next" />}
    </nav>
  );
}

function NavButton({
  post,
  direction,
}: {
  post: PostMeta;
  direction: "prev" | "next";
}) {
  const defaultCover = withBasePath("/images/default-blog-cover.png");
  const coverImage = post.frontmatter.coverImage
    ? withBasePath(post.frontmatter.coverImage)
    : defaultCover;

  const isNext = direction === "next";

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "group flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-muted/50",
        isNext ? "flex-row-reverse text-right" : "flex-row text-left"
      )}
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={coverImage}
          alt={post.frontmatter.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span
          className={cn(
            "text-xs text-muted-foreground font-medium flex items-center gap-1 w-full",
            isNext && "justify-end"
          )}
        >
          {isNext ? (
            <>
              다음 글 <ChevronRight className="h-3 w-3" />
            </>
          ) : (
            <>
              <ChevronLeft className="h-3 w-3" /> 이전 글
            </>
          )}
        </span>
        <span className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {post.frontmatter.title}
        </span>
      </div>
    </Link>
  );
}
