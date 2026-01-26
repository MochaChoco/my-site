import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="border-b print:hidden">
      <div className="container mx-auto px-4 py-3 sm:py-0 sm:h-16 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="font-bold text-xl">
          MochaChoco's DevBlog
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm sm:gap-6 sm:text-base">
          <Link href="/posts" className="hover:text-primary transition-colors">
            Posts
          </Link>
          <Link href="/tags" className="hover:text-primary transition-colors">
            Tags
          </Link>
          <Link href="/search" className="hover:text-primary transition-colors">
            Search
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            About Me
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
