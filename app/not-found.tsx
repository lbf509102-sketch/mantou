import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFDF5] px-4">
      <div className="neo-card max-w-xl rotate-[-1deg] bg-white p-8 text-center">
        <p className="mb-4 inline-block border-4 border-black bg-[#FFD93D] px-4 py-2 text-sm font-black uppercase tracking-[0.2em]">
          404
        </p>
        <h1 className="text-4xl font-black uppercase leading-none tracking-tight">
          This page wandered off the poster wall.
        </h1>
        <p className="mt-4 text-lg font-bold leading-relaxed">
          The route is missing, but the site is still very much alive.
        </p>
        <Link href="/" className="neo-button mt-8 bg-[#FF6B6B]">
          Go Home
        </Link>
      </div>
    </main>
  );
}
