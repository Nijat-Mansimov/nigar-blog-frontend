import { Link } from "react-router-dom";
import { Article } from "@/services/articleService";
import { Eye } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  size?: "large" | "medium" | "small";
  index?: number;
}

const ArticleCard = ({ article, size = "medium", index = 0 }: ArticleCardProps) => {
  const views = article.views || 0;

  // Get the translation - find first language with actual content
  // Priority: defaultLanguage (if it has content) > first language with content
  const defaultLang = (article.defaultLanguage as "en" | "az" | "ru" | "tr") || "az";
  
  // Find all languages that have at least a title
  const availableLangs = (Object.keys(article.translations || {}) as Array<"en" | "az" | "ru" | "tr">)
    .filter(lang => article.translations?.[lang]?.title?.trim());
  
  // Choose language: prefer defaultLanguage, otherwise first available
  const translationLang = availableLangs.includes(defaultLang)
    ? defaultLang
    : availableLangs[0] || "az";
  
  const translation = article.translations?.[translationLang] || {
    title: "Article",
    subtitle: "",
    excerpt: "",
    body: "",
  };

  if (size === "large") {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="block group fade-up"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <article className="card-3d border border-rule bg-card p-4 sm:p-8 md:p-12 cursor-pointer">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="font-sans-clean text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              {article.category}
            </span>
            <div className="w-6 sm:w-8 h-px bg-rule" />
            <span className="font-sans-clean text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              {article.date}
            </span>
          </div>

          <h2 className="font-headline text-2xl sm:text-4xl md:text-6xl font-black leading-none tracking-tight text-ink mb-4 group-hover:opacity-80 transition-opacity">
            {translation.title}
          </h2>

          <p className="font-headline text-base sm:text-lg md:text-xl italic text-muted-foreground mb-6 leading-relaxed">
            {translation.subtitle}
          </p>

          <p className="font-body text-sm sm:text-base md:text-lg leading-relaxed text-foreground/80 mb-8 max-w-2xl">
            {translation.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-sans-clean text-xs tracking-[0.25em] uppercase text-ink border-b border-ink pb-0.5 group-hover:opacity-60 transition-opacity">
              Continue Reading →
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye size={12} />
              <span className="font-sans-clean text-[11px]">{views.toLocaleString()}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (size === "small") {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="block group fade-up"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <article className="py-4 border-b border-rule last:border-0 cursor-pointer hover:opacity-70 transition-opacity">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-sans-clean text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
              {article.category}
            </span>
          </div>
          <h3 className="font-headline text-lg font-bold leading-tight text-ink mb-1">
            {translation.title}
          </h3>
          <p className="font-body text-sm text-muted-foreground leading-snug">
            {translation.excerpt.slice(0, 90)}…
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
            <Eye size={10} />
            <span className="font-sans-clean text-[10px]">{views.toLocaleString()}</span>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${article.slug}`}
      className="block group fade-up h-full"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <article className="card-3d border border-rule bg-card cursor-pointer h-full flex flex-col overflow-hidden">
        {/* Image Area */}
        <div className="relative w-full bg-gradient-to-br from-muted to-muted-foreground/20 overflow-hidden">
          {article.image ? (
            <img
              src={article.image}
              alt={translation.title}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-ink/5 to-ink/10">
              <div className="text-center">
                <span className="font-headline text-2xl italic font-black text-ink/30">
                  {article.category.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans-clean text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
              {article.category}
            </span>
            <div className="flex-1 h-px bg-rule" />
            <span className="font-sans-clean text-[9px] text-muted-foreground">
              {article.readingTime} min
            </span>
          </div>

          <h3 className="font-headline text-lg md:text-xl font-bold leading-tight text-ink mb-2 group-hover:opacity-80 transition-opacity line-clamp-2">
            {translation.title}
          </h3>

          <p className="font-headline text-xs italic text-muted-foreground mb-2 line-clamp-1">
            {translation.subtitle}
          </p>

          <p className="font-body text-sm leading-relaxed text-foreground/70 mb-4 line-clamp-2 flex-1">
            {translation.excerpt}
          </p>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-rule">
            <span className="font-sans-clean text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
              {article.date}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye size={11} />
              <span className="font-sans-clean text-[11px]">{views.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;
