import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { buildPageMetadata } from "@/lib/metadata";
import { ScrollToTop } from "@/components/scroll-to-top";

export const metadata = buildPageMetadata("/");

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Latest Posts
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          Writing about technology, coding, and everything in between.
        </p>
      </div>
      <hr />
      <div className="grid gap-10">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <ScrollToTop />
    </div>
  );
}
