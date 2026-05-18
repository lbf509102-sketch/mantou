import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles, Star, Zap } from "lucide-react";
import { articles, featuredProjects } from "../data/site";

export function HomePage() {
  const latest = articles[0];

  return (
    <>
      <section className="relative overflow-hidden border-b-8 border-black bg-grid bg-[#FFFDF5]">
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex rotate-[-3deg] items-center gap-2 border-4 border-black bg-[#FFD93D] px-4 py-2 font-black uppercase tracking-[0.2em] neo-shadow-sm">
              <Sparkles className="h-5 w-5 stroke-[3px]" />
              Designer + Builder + Note Taker
            </div>

            <div className="space-y-5">
              <p className="max-w-fit rotate-[2deg] border-4 border-black bg-white px-3 py-2 text-sm font-bold uppercase tracking-[0.22em] neo-shadow-sm">
                Based in Shanghai / Building on the loud internet
              </p>

              <div className="space-y-2 leading-[0.86] uppercase">
                <h1 className="text-5xl font-black tracking-tight sm:text-7xl lg:text-[7rem]">
                  <span className="text-outline block">MAKE</span>
                  <span className="inline-block rotate-[-2deg] bg-[#FF6B6B] px-3 py-1">
                    THINGS
                  </span>{" "}
                  <span className="inline-block rotate-[1deg] border-4 border-black bg-white px-3 py-1 neo-shadow-sm">
                    PEOPLE
                  </span>
                  <span className="block">REMEMBER</span>
                </h1>
              </div>

              <p className="max-w-2xl text-lg font-bold leading-relaxed sm:text-xl">
                I build editorial products, playful interfaces, and small systems
                for creative work. This site is my notebook, portfolio, and
                public sketch wall.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="#work" className="neo-button bg-[#FF6B6B]">
                Explore Work
                <ArrowRight className="h-4 w-4 stroke-[3px]" />
              </Link>
              <Link href={`/${latest.slug}`} className="neo-button bg-white">
                Read Latest Note
                <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Projects shipped", value: "24" },
                { label: "Writing streak", value: "118 days" },
                { label: "Current mode", value: "LOUD" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`neo-card p-4 ${index === 1 ? "rotate-[1.5deg] bg-[#C4B5FD]" : "bg-white"}`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em]">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-black uppercase">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[440px]">
            <div className="absolute right-0 top-0 h-28 w-28 rotate-[10deg] border-4 border-black bg-[#FFD93D] neo-shadow-md" />
            <div className="absolute left-3 top-16 h-16 w-16 rounded-full border-4 border-black bg-[#C4B5FD]" />
            <div className="absolute right-14 top-20 inline-flex rotate-[8deg] items-center gap-2 border-4 border-black bg-white px-4 py-2 font-black uppercase tracking-[0.18em] neo-shadow-sm">
              <Zap className="h-4 w-4 fill-black stroke-[3px]" />
              New Drop
            </div>

            <div className="neo-card absolute inset-x-0 top-16 rotate-[-2deg] overflow-hidden bg-white">
              <div className="border-b-4 border-black bg-[#C4B5FD] px-4 py-3 text-sm font-black uppercase tracking-[0.18em]">
                Studio Snapshot
              </div>
              <div className="relative aspect-[4/5]">
                <Image
                  src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80"
                  alt="Desk with design tools and laptop"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="neo-card absolute bottom-0 right-2 z-10 max-w-xs rotate-[3deg] bg-[#FFD93D] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">
                Current focus
              </p>
              <p className="mt-3 text-2xl font-black uppercase leading-tight">
                Turning messy ideas into tactile digital objects.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="work"
        className="border-b-8 border-black bg-[#FFD93D] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 inline-block rotate-[-2deg] border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.2em] neo-shadow-sm">
                Selected work
              </p>
              <h2 className="max-w-3xl text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
                Big shapes. Sharp edges. Human systems.
              </h2>
            </div>
            <p className="max-w-xl text-lg font-bold leading-relaxed">
              I like products that feel useful before they feel polished. These
              projects balance strong systems with personality that people can
              actually sense.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <article
                key={project.title}
                className={`neo-card flex h-full flex-col justify-between p-6 ${index === 1 ? "rotate-[1.5deg]" : index === 2 ? "rotate-[-1deg]" : ""}`}
                style={{ backgroundColor: project.accent }}
              >
                <div>
                  <p className="mb-4 inline-flex border-4 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
                    {project.tag}
                  </p>
                  <h3 className="text-3xl font-black uppercase leading-tight">
                    {project.title}
                  </h3>
                  <p className="mt-4 text-base font-bold leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em]">
                  See case notes
                  <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="notes"
        className="border-b-8 border-black bg-black py-16 text-white sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 inline-block rotate-[2deg] border-4 border-white bg-[#FF6B6B] px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_0_#fff]">
                Writing archive
              </p>
              <h2 className="max-w-3xl text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
                Notes, essays, process scraps.
              </h2>
            </div>
            <p className="max-w-xl text-lg font-bold leading-relaxed text-white">
              A content template with clear hierarchy, fast scanning, and enough
              attitude to keep long-form pages from feeling sleepy.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {articles.map((article, index) => (
              <Link
                key={article.slug}
                href={`/${article.slug}`}
                className={`block border-4 border-white bg-[#FFFDF5] p-6 text-black transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#fff] ${index === 1 ? "rotate-[1deg]" : "rotate-[-1deg]"} `}
              >
                <div className="mb-5 flex flex-wrap gap-3">
                  <span className="border-4 border-black bg-[#FFD93D] px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
                    {article.category}
                  </span>
                  <span className="border-4 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
                    {article.readTime}
                  </span>
                </div>
                <h3 className="text-3xl font-black uppercase leading-tight">
                  {article.title}
                </h3>
                <p className="mt-3 text-lg font-bold leading-relaxed">
                  {article.summary}
                </p>
                <div className="mt-6 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em]">
                  Open article
                  <ArrowRight className="h-4 w-4 stroke-[3px]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="border-b-8 border-black bg-[#C4B5FD] py-16 sm:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="space-y-4">
            <p className="inline-block rotate-[-2deg] border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.2em] neo-shadow-sm">
              About
            </p>
            <h2 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
              A portfolio disguised as a zine.
            </h2>
          </div>

          <div className="neo-card rotate-[1deg] bg-white p-6 sm:p-8">
            <p className="text-xl font-bold leading-relaxed">
              I work across product design, frontend systems, and writing. I am
              interested in interfaces that feel authored, playful, and useful
              without sanding off their personality.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Design systems with teeth",
                "Editorial and portfolio sites",
                "Frontend prototyping",
                "Creative tooling for small teams",
              ].map((item) => (
                <div
                  key={item}
                  className="border-4 border-black bg-[#FFFDF5] p-4 text-sm font-black uppercase tracking-[0.14em]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="relative overflow-hidden bg-[#FF6B6B] py-16 sm:py-20"
      >
        <div className="absolute inset-0 bg-halftone opacity-40" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mx-auto mb-5 max-w-fit rotate-[2deg] border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.2em] neo-shadow-sm">
            Contact
          </p>
          <h2 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
            Let&apos;s make something impossible to ignore.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-relaxed">
            Available for collaborations, design direction, and frontend builds
            that need more personality than a polite template can offer.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="mailto:hello@kaivoss.studio" className="neo-button bg-white">
              hello@kaivoss.studio
            </Link>
            <Link href="/" className="neo-button bg-[#FFD93D]">
              Download Resume
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
