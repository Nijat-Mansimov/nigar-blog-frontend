import { useEffect, useRef, useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import { articleService, Article } from "@/services/articleService";
import { useLanguage } from "@/context/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const [featured, setFeatured] = useState<Article | null>(null);
  const [secondary, setSecondary] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const allArticles = await articleService.getAllArticles();
        
        // Get featured article from the list (first one or marked as featured)
        const featuredArticle = allArticles.find((a) => a.featured) || allArticles[0] || null;
        setFeatured(featuredArticle);

        // Get secondary articles sorted by date (all articles)
        const secondaryArticles = allArticles
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSecondary(secondaryArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
      setLoading(false);
    };

    fetchArticles();
  }, []);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const y = window.scrollY;
        heroRef.current.style.transform = `translateY(${y * 0.18}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Masthead */}
      <div className="max-w-6xl mx-auto px-6 pb-4">
        <div className="rule-top pt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans-clean text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              Vol. I, No. 6
            </span>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-12 h-px bg-rule" />
              <span className="font-sans-clean text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                {t('hero.essaysSubtitle')}
              </span>
              <div className="w-12 h-px bg-rule" />
            </div>
            <span className="font-sans-clean text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              February 2026
            </span>
          </div>
          <div className="h-px bg-ink" />
        </div>
      </div>

      {/* Hero section with parallax */}
      <div className="max-w-6xl mx-auto px-6 mb-12 overflow-hidden">
        <div ref={heroRef} className="parallax-hero">
          {featured ? (
            <ArticleCard article={featured} size="large" index={0} />
          ) : (
            <div className="h-96 bg-card border border-rule rounded animate-pulse" />
          )}
        </div>
      </div>

      {/* Section divider */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-px bg-ink flex-1" />
          <span className="font-sans-clean text-[10px] tracking-[0.4em] uppercase text-ink">
            {t('latestEssays.title')}
          </span>
          <div className="h-px bg-ink flex-1" />
        </div>
      </div>

      {/* Secondary articles grid */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 stagger">
          {secondary.slice(0, 3).map((article, i) => (
            <div key={article.id} className={`${i < 2 ? "md:border-r border-rule" : ""}`}>
              <div className="p-4 md:p-6">
                <ArticleCard article={article} size="medium" index={i} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography Showcase Section - Classic Journal Design */}
      <div className="bg-background border-t-2 border-b-2 border-ink py-16 my-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-ink" />
              <span className="font-sans-clean text-[10px] tracking-[0.4em] uppercase text-ink">
                {t('typography.title')}
              </span>
              <div className="flex-1 h-px bg-ink" />
            </div>
            <h2 className="font-headline text-5xl italic font-black text-ink text-center mt-6 mb-2">
              {t('typography.theorists.heading')}
            </h2>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex-1 h-px bg-rule" />
              <span className="font-sans-clean text-[9px] tracking-[0.35em] uppercase text-muted-foreground">
                {t('typography.theorists.subtitle')}
              </span>
              <div className="flex-1 h-px bg-rule" />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-12">
            {/* Left Column - Theorist References */}
            <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-rule pb-6 md:pb-0 md:pr-8">
              <div className="space-y-6">
                <div>
                  <span className="font-sans-clean text-[9px] tracking-[0.4em] uppercase text-muted-foreground block mb-2">
                    {t('typography.theorists.mcluhan.title')}
                  </span>
                  <h3 className="font-headline text-2xl italic text-ink mb-3">
                    {t('typography.theorists.mcluhan.name')}
                  </h3>
                  <blockquote className="border-l-2 border-ink pl-4">
                    <p className="font-body text-ink text-sm leading-relaxed italic">
                      "{t('typography.theorists.mcluhan.quote')}"
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Center Column - Theorist */}
            <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-rule pb-6 md:pb-0 md:pr-8 md:pl-8">
              <div className="space-y-6">
                <div>
                  <span className="font-sans-clean text-[9px] tracking-[0.4em] uppercase text-muted-foreground block mb-2">
                    {t('typography.theorists.barthes.title')}
                  </span>
                  <h3 className="font-headline text-2xl italic text-ink mb-3">
                    {t('typography.theorists.barthes.name')}
                  </h3>
                  <blockquote className="border-l-2 border-ink pl-4">
                    <p className="font-body text-ink text-sm leading-relaxed italic">
                      "{t('typography.theorists.barthes.quote')}"
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Right Column - Theorist */}
            <div className="md:col-span-1 md:pl-8">
              <div className="space-y-6">
                <div>
                  <span className="font-sans-clean text-[9px] tracking-[0.4em] uppercase text-muted-foreground block mb-2">
                    {t('typography.theorists.derrida.title')}
                  </span>
                  <h3 className="font-headline text-2xl italic text-ink mb-3">
                    {t('typography.theorists.derrida.name')}
                  </h3>
                  <blockquote className="border-l-2 border-ink pl-4">
                    <p className="font-body text-ink text-sm leading-relaxed italic">
                      "{t('typography.theorists.derrida.quote')}"
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom divider */}
          <div className="flex items-center gap-4 mt-12">
            <div className="flex-1 h-px bg-rule" />
          </div>

          {/* Closing Quote */}
          <div className="mt-12 text-center">
            <blockquote className="max-w-2xl mx-auto">
              <p className="font-body text-ink text-lg leading-relaxed italic">
                "{t('typography.theorists.foucault.quote')}"
              </p>
              <footer className="font-headline text-sm italic text-muted-foreground mt-4">
                — {t('typography.theorists.foucault.name')}
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Bottom row — two columns */}
      <div className="max-w-6xl mx-auto px-6 mb-16 border-t border-rule pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-sans-clean text-[10px] tracking-[0.35em] uppercase text-ink font-medium">
                {t('archive.title')}
              </span>
              <div className="flex-1 h-px bg-ink" />
            </div>
            <div className="stagger">
              {secondary.length > 3 ? (
                secondary.slice(3).map((article, i) => (
                  <ArticleCard key={article.id} article={article} size="small" index={i} />
                ))
              ) : secondary.length > 0 ? (
                <p className="font-body text-sm text-muted-foreground">{t('archive.allFeatured')}</p>
              ) : (
                <p className="font-body text-sm text-muted-foreground">{t('archive.noArticles')}</p>
              )}
            </div>
          </div>

          <div className="border-l border-rule pl-8 flex flex-col justify-center items-center text-center py-8">
            <div className="mb-6">
              <div className="w-16 h-px bg-ink mx-auto mb-4" />
              <p className="font-headline text-3xl italic leading-snug text-ink max-w-xs">
                "{t('hero.writingQuote')}"
              </p>
              <div className="w-16 h-px bg-ink mx-auto mt-4" />
            </div>
            <span className="font-sans-clean text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              — Nigar Shah
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-ink">
        <div className="border-t border-rule" />
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-headline text-lg font-black text-ink">Nigar Shah</span>
          <span className="font-sans-clean text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            {t('footer.copyright')}
          </span>
          <span className="font-sans-clean text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            {t('footer.designedWith')}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
