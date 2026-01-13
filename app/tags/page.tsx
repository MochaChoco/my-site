import Link from "next/link";
import { getAllTags } from "@/lib/posts";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/tags");

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Tags
        </h1>
        <p className="text-xl text-muted-foreground">Browse posts by topic.</p>
      </div>
      <hr />
      <div className="flex flex-wrap gap-4">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${tag}`}
            className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-lg font-medium"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
