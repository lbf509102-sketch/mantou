import Link from "next/link";
import { ArrowRight, Menu, Star } from "lucide-react";
import { navItems } from "../data/site";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFFDF5] text-black">
      <header className="sticky top-0 z-50 border-b-4 border-black bg-[#FFFDF5]/95 backdrop-blur-none">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex rotate-[-2deg] items-center gap-3 border-4 border-black bg-[#FF6B6B] px-4 py-3 font-black uppercase tracking-[0.2em] neo-shadow-sm"
          >
            <Star className="h-5 w-5 fill-black stroke-[2.5]" />
            KAI VOSS
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-4 border-transparent px-3 py-2 text-sm font-bold uppercase tracking-[0.18em] transition duration-100 hover:-translate-y-0.5 hover:border-black hover:bg-[#FFD93D] hover:shadow-[4px_4px_0_0_#000]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            aria-label="Open navigation"
            className="inline-flex h-14 w-14 items-center justify-center border-4 border-black bg-white neo-shadow-sm md:hidden"
          >
            <Menu className="h-7 w-7 stroke-[3px]" />
          </button>

          <Link
            href="#contact"
            className="neo-button hidden bg-[#C4B5FD] md:inline-flex"
          >
            Say Hello
            <ArrowRight className="h-4 w-4 stroke-[3px]" />
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
