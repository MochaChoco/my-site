import Link from "next/link";
import Image from "next/image";
import { PostMeta } from "@/lib/posts";
import { withBasePath } from "@/lib/base-path";
import { formatDate } from "@/lib/utils";

interface RelatedPostsProps {
  posts: PostMeta[];
}

/**
 * 포스트 상세 페이지 하단에 표시되는 연관 포스트 목록 컴포넌트
 */
export function RelatedPosts({ posts }: RelatedPostsProps) {
  // 연관된 글이 없으면 아무것도 렌더링하지 않음
  if (posts.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t print:hidden">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <RelatedPostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

/**
 * 개별 연관 포스트 카드 컴포넌트
 */
function RelatedPostCard({ post }: { post: PostMeta }) {
  // 커버 이미지가 없을 경우 기본 이미지 사용
  const defaultCover = withBasePath("/images/default-blog-cover.png");
  const coverImage = post.frontmatter.coverImage
    ? withBasePath(post.frontmatter.coverImage)
    : defaultCover;

  return (
    <Link href={`/posts/${post.slug}`} className="group block h-full">
      <article className="flex flex-col h-full overflow-hidden rounded-lg bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/80">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={coverImage}
            alt={post.frontmatter.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="flex flex-col flex-1 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <time>{formatDate(post.frontmatter.date)}</time>
          </div>
          <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {post.frontmatter.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {post.frontmatter.description}
          </p>
          {/* 태그 목록: 최대 3개까지만 표시하고 나머지는 숫자로 표시 */}
          <div className="flex flex-wrap gap-1 mt-2 pt-2">
            {post.frontmatter.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground"
              >
                #{tag}
              </span>
            ))}
            {(post.frontmatter.tags?.length || 0) > 3 && (
              <span className="text-xs text-muted-foreground self-center">
                +{post.frontmatter.tags!.length - 3}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
