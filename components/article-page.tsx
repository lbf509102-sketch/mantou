import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { Article } from "../data/site";

export function ArticlePage({
  article,
  nextArticle,
}: {
  article: Article;
  nextArticle?: Article;
}) {
  return (
    <>
      <section className="relative overflow-hidden border-b-8 border-black bg-grid bg-[#FFFDF5]">
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-18 lg:px-8 lg:py-20">
          <Link
            href="/"
            className="mb-8 inline-flex rotate-[-2deg] items-center gap-3 border-4 border-black bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.2em] neo-shadow-sm transition duration-100 hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4 stroke-[3px]" />
            Back Home
          </Link>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <div className="inline-flex rotate-[2deg] items-center gap-2 border-4 border-black bg-[#FFD93D] px-4 py-2 text-sm font-black uppercase tracking-[0.2em] neo-shadow-sm">
                <Star className="h-4 w-4 fill-black stroke-[2.5]" />
                {article.category}
              </div>
              <h1 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl">
                {article.title}
              </h1>
              <p className="text-xl font-bold leading-relaxed">
                {article.summary}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.16em]">
                  {article.date}
                </span>
                <span className="border-4 border-black bg-[#C4B5FD] px-4 py-2 text-sm font-black uppercase tracking-[0.16em]">
                  {article.readTime}
                </span>
              </div>
            </div>

            <div className="neo-card rotate-[2deg] overflow-hidden bg-white">
              <div className="relative aspect-[16/11]">
                <Image
                  src={article.heroImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-8 border-black bg-black py-14 text-white sm:py-18">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
          <aside className="space-y-4">
            <div className="border-4 border-white bg-[#FF6B6B] p-4 text-black shadow-[4px_4px_0_0_#fff]">
              <p className="text-xs font-black uppercase tracking-[0.2em]">
                Kicker
              </p>
              <p className="mt-3 text-lg font-black uppercase leading-snug">
                {article.kicker}
              </p>
            </div>
            <div className="border-4 border-white bg-transparent p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em]">
                Structure
              </p>
              <ul className="mt-3 space-y-3 text-sm font-bold uppercase tracking-[0.12em]">
                {article.sections.map((section) => (
                  <li key={section.heading}>{section.heading}</li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="space-y-8">
            {article.sections.map((section, index) => (
              <section
                key={section.heading}
                className={`border-4 p-6 sm:p-8 ${index % 2 === 0 ? "border-white bg-[#FFFDF5] text-black" : "border-black bg-[#FFD93D] text-black"}`}
              >
                <h2 className="text-3xl font-black uppercase leading-tight sm:text-4xl">
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-4 text-lg font-bold leading-relaxed">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </article>
        </div>
      </section>

      <section className="bg-[#C4B5FD] py-14 sm:py-18">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="neo-card rotate-[-1deg] bg-white p-6 sm:p-8">
            <p className="mb-3 inline-block border-4 border-black bg-[#FFD93D] px-4 py-2 text-sm font-black uppercase tracking-[0.2em]">
              Next read
            </p>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-black uppercase leading-tight sm:text-5xl">
                  {nextArticle?.title ?? "More notes coming soon"}
                </h2>
                <p className="mt-4 max-w-3xl text-lg font-bold leading-relaxed">
                  {nextArticle?.summary ??
                    "This content template is ready for more essays, project writeups, and experiments."}
                </p>
              </div>
              <Link
                href={nextArticle ? `/${nextArticle.slug}` : "/"}
                className="neo-button bg-[#FF6B6B]"
              >
                Keep Reading
                <ArrowRight className="h-4 w-4 stroke-[3px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
