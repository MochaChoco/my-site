import Link from "next/link";
import Image from "next/image";
import { PostMeta } from "@/lib/posts";

export function PostCard({ post }: { post: PostMeta }) {
  const basePath = "/my-site";
  const defaultCover = `${basePath}/images/default-blog-cover.png`;
  const coverImage = post.frontmatter.coverImage
    ? `${basePath}${post.frontmatter.coverImage}`
    : defaultCover;

  return (
    <Link href={`/posts/${post.slug}`}>
      <article className="group relative flex gap-4 cursor-pointer transition-transform hover:scale-[1.02]">
        <div className="flex-shrink-0 w-48 h-32 relative overflow-hidden rounded-lg">
          <Image
            src={coverImage}
            alt={post.frontmatter.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col space-y-2 flex-1">
          <h2 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
            {post.frontmatter.title}
          </h2>
          <div className="flex gap-2 text-sm text-muted-foreground">
            {post.frontmatter.tags?.map((tag) => (
              <span key={tag} className="bg-secondary px-2 py-1 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground line-clamp-3">
            {post.frontmatter.description}
          </p>
        </div>
      </article>
    </Link>
  );
}
