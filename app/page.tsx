import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/");

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Latest Posts
        </h1>
        <p className="text-xl text-muted-foreground">
          Writing about technology, coding, and everything in between.
        </p>
      </div>
      <hr />
      <div className="grid gap-10">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
