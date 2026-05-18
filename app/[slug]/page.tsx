import { notFound } from "next/navigation";
import { ArticlePage } from "../../components/article-page";
import { SiteShell } from "../../components/site-shell";
import { articles } from "../../data/site";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function ArticleRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articleIndex = articles.findIndex((article) => article.slug === slug);

  if (articleIndex === -1) {
    notFound();
  }

  const article = articles[articleIndex];
  const nextArticle = articles[(articleIndex + 1) % articles.length];

  return (
    <SiteShell>
      <ArticlePage article={article} nextArticle={nextArticle} />
    </SiteShell>
  );
}
