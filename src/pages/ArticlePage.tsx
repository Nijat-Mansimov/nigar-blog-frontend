import { useParams, Link, Navigate } from "react-router-dom";
import { articleService, Article } from "@/services/articleService";
import { Eye, Clock, ArrowLeft, Globe, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { markdownToHtml } from "@/lib/markdown";

type Language = "en" | "az" | "ru" | "tr";

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  az: "Azərbaycanca",
  ru: "Русский",
  tr: "Türkçe",
};

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [displayViews, setDisplayViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("az");
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await articleService.getArticleBySlug(slug);
      setArticle(data);
      
      // Set initial language to first available with content in article
      if (data && data.translations) {
        // Find languages that actually have content (title + body)
        const availableLangs = (Object.keys(data.translations) as Language[])
          .filter(lang => data.translations?.[lang]?.title?.trim() && data.translations?.[lang]?.body?.trim());
        
        const defaultLang = (data.defaultLanguage as Language) || "az";
        
        // Try to use defaultLanguage first, then first available
        const initialLang = availableLangs.includes(defaultLang) 
          ? defaultLang 
          : availableLangs[0] || "az";
        setSelectedLanguage(initialLang);
      }
      
      if (data) {
        const viewCount = await articleService.incrementViewCount(slug);
        setDisplayViews(viewCount);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [slug]);

  useEffect(() => {
    if (displayViews > 0) {
      // Count-up animation
      const start = displayViews - 1;
      let current = start;
      const step = Math.ceil((displayViews - start) / 20);
      const interval = setInterval(() => {
        current += step;
        if (current >= displayViews) {
          current = displayViews;
          clearInterval(interval);
        }
        setDisplayViews(current);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [displayViews]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (!article) return <Navigate to="/" replace />;

  // Get available languages for this article (only those with actual content)
  const availableLanguages = (Object.keys(article.translations || {}) as Language[])
    .filter(lang => article.translations?.[lang]?.title?.trim() && article.translations?.[lang]?.body?.trim());
  
  // Get the translation for selected language, fallback to first available
  const translation = (article.translations?.[selectedLanguage]?.title?.trim() 
    ? article.translations[selectedLanguage] 
    : availableLanguages.length > 0 
      ? article.translations?.[availableLanguages[0]] 
      : null) || {
    title: "Article",
    subtitle: "",
    excerpt: "",
    body: "",
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Article header */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-sans-clean text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-ink transition-colors mb-8 group fade-up"
        >
          <ArrowLeft size={11} className="group-hover:-translate-x-1 transition-transform" />
          Journal
        </Link>

        {/* Category + date */}
        <div className="flex items-center gap-4 mb-6 fade-up" style={{ animationDelay: "0.05s" }}>
          <span className="font-sans-clean text-[10px] tracking-[0.35em] uppercase text-ink border border-ink px-2 py-0.5">
            {article.category}
          </span>
          <span className="font-sans-clean text-[10px] tracking-[0.2em] text-muted-foreground">
            {article.date}
          </span>
        </div>

        {/* Title */}
        <div className="border-t border-rule pt-6 mb-6 fade-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-ink mb-4">
            {translation.title}
          </h1>
          
          {/* Subtitle */}
          <p className="font-headline text-base sm:text-lg italic text-muted-foreground leading-relaxed">
            {translation.subtitle}
          </p>
        </div>

        {/* Meta bar with Language Selector */}
        <div
          className="flex items-center gap-3 sm:gap-6 py-4 border-b border-rule mb-8 fade-up flex-wrap text-xs sm:text-sm"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={12} />
            <span className="font-sans-clean text-[10px] sm:text-[11px] tracking-[0.15em]">
              {article.readingTime} min
            </span>
          </div>
          <div className="w-px h-3 sm:h-4 bg-rule" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye size={12} />
            <span
              key={displayViews}
              className="font-sans-clean text-[10px] sm:text-[11px] tracking-[0.15em] count-animate"
            >
              {displayViews.toLocaleString()}
            </span>
          </div>
          <div className="w-px h-3 sm:h-4 bg-rule" />
          <span className="font-sans-clean text-[10px] sm:text-[11px] tracking-[0.15em] text-muted-foreground">
            By Nigar
          </span>
          
          {/* Language Selector Button */}
          {availableLanguages.length > 1 && (
            <>
              <div className="w-px h-4 bg-rule" />
              <div className="relative">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  aria-haspopup="listbox"
                  aria-expanded={showLanguageSelector}
                  aria-controls="article-language-menu"
                  className="relative z-50 flex items-center gap-2 px-3 py-1.5 text-ink bg-transparent hover:bg-muted/50 transition-all duration-150 font-sans-clean text-[11px] tracking-[0.12em] uppercase rounded border border-rule shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink"
                  type="button"
                >
                  <Globe size={13} />
                  <span className="font-semibold">{LANGUAGE_LABELS[selectedLanguage]}</span>
                  <ChevronDown size={11} className={`ml-1 transition-transform duration-200 ${showLanguageSelector ? 'rotate-180' : ''}`} />
                </button>

                {/* Language Dropdown */}
                {showLanguageSelector && (
                  <>
                    {/* Backdrop to close when clicking outside */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowLanguageSelector(false)}
                    />

                    {/* Dropdown Menu */}
                    <div id="article-language-menu" role="listbox" className="absolute bottom-full right-0 mb-2 bg-card border border-rule rounded-lg shadow-2xl z-60 min-w-48 overflow-hidden">
                      <div className="p-1">
                        {availableLanguages.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => {
                              setSelectedLanguage(lang);
                              setShowLanguageSelector(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[12px] tracking-[0.12em] uppercase font-semibold transition-colors duration-150 rounded flex items-center justify-between ${
                              selectedLanguage === lang
                                ? "bg-ink text-background"
                                : "text-ink hover:bg-subtle"
                            }`}
                            type="button"
                          >
                            <span>{LANGUAGE_LABELS[lang]}</span>
                            {selectedLanguage === lang && (
                              <span className="w-2 h-2 bg-background rounded-full ml-2 inline-block" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Article body - Clean single column */}
      <article className="max-w-3xl mx-auto px-6 mb-20">
        <div
          dangerouslySetInnerHTML={{ __html: markdownToHtml(translation.body) }}
          className="fade-up text-foreground article-body text-base sm:text-lg"
          style={{ 
            animationDelay: "0.25s",
            lineHeight: "1.8",
          }}
        />
        <style>{`
          .article-body p {
            margin-bottom: 1.25rem;
            text-align: justify;
          }
          
          .article-body h2 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-size: 1.75rem;
            font-weight: 700;
            line-height: 1.2;
          }
          
          .article-body h3 {
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            font-size: 1.25rem;
            font-weight: 700;
            line-height: 1.2;
          }
          
          .article-body blockquote {
            padding: 1.5rem 0 1.5rem 1.5rem;
            margin: 2rem 0;
            border-left: 3px solid var(--ink);
            font-style: italic;
            color: var(--muted-foreground);
          }
          
          .article-body img {
            max-width: 100%;
            height: auto;
            margin: 2rem 0;
            border-radius: 0.5rem;
          }
          
          .article-body ul, 
          .article-body ol {
            margin: 1.5rem 0;
            padding-left: 2rem;
          }
          
          .article-body li {
            margin-bottom: 0.75rem;
            line-height: 1.85;
          }
          
          .article-body strong {
            font-weight: 700;
          }
          
          .article-body em {
            font-style: italic;
          }
          
          .article-body a {
            color: var(--ink);
            text-decoration: underline;
            text-decoration-thickness: 1px;
            text-underline-offset: 0.25rem;
          }
          
          .article-body a:hover {
            opacity: 0.7;
          }
        `}</style>
      </article>

      {/* Bottom signature */}
      <div className="max-w-3xl mx-auto px-6 mb-16 border-t border-rule pt-8 flex items-center justify-between">
        <div>
          <span className="font-headline text-sm font-bold text-ink">Nigar Shah</span>
          <br />
          <span className="font-sans-clean text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            {article.date}
          </span>
        </div>
        <Link
          to="/"
          className="font-sans-clean text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-ink transition-colors ink-link"
        >
          ← Back to Journal
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-ink">
        <div className="border-t border-rule" />
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-headline text-lg font-black text-ink">Nigar Shah</span>
          <span className="font-sans-clean text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            © 2026 · All Rights Reserved
          </span>
        </div>
      </footer>
    </div>
  );
};

export default ArticlePage;
