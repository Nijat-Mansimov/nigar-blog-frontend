import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArticleCard from "@/components/ArticleCard";
import { articleService, Article } from "@/services/articleService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Grid, List } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Articles = () => {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allArticles = await articleService.getAllArticles();
        setArticles(allArticles);
        setFilteredArticles(allArticles);

        // Fetch categories from database
        const dbCategories = await articleService.getCategories();
        const categoryNames = dbCategories.map((cat: any) => cat.name || cat);
        const cats = ["All", ...categoryNames];
        setCategories(cats);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => {
        const translations = a.translations || {};
        const langs = Object.values(translations) as any[];
        return langs.some(
          (t) =>
            t?.title?.toLowerCase().includes(query) ||
            t?.excerpt?.toLowerCase().includes(query) ||
            t?.subtitle?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredArticles(filtered);
  }, [searchQuery, selectedCategory, articles]);

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Masthead */}
      <div className="max-w-7xl mx-auto px-6 pb-4">
        <div className="rule-top pt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans-clean text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              {t('articlesPage.readingLibrary')}
            </span>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-12 h-px bg-rule" />
              <span className="font-sans-clean text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                {t('articlesPage.allArticles')}
              </span>
              <div className="w-12 h-px bg-rule" />
            </div>
            <span className="font-sans-clean text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              {filteredArticles.length} {t('articlesPage.articlesCount')}
            </span>
          </div>
          <div className="h-px bg-ink" />
        </div>
      </div>

      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl italic font-black text-ink mb-3">
          {t('articlesPage.title')}
        </h1>
        <p className="font-sans text-base sm:text-lg text-muted-foreground max-w-2xl">
          {t('articlesPage.subtitle')}
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('articlesPage.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter and View Mode */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  className="font-sans-clean tracking-widest"
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                title="List view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Display */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 rounded border border-rule bg-card p-8 text-center">
            <p className="text-base sm:text-lg text-muted-foreground mb-2">{t('articlesPage.noResults')}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('articlesPage.tryAdjusting')}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-max">
            {filteredArticles.map((article, idx) => {
              // Simplified masonry for better mobile support
              const getMasonryClass = (index: number) => {
                const pattern = [
                  "sm:col-span-2 sm:row-span-2",
                  "col-span-1",
                  "col-span-1",
                  "sm:col-span-2",
                  "col-span-1",
                  "col-span-1",
                ];
                return pattern[index % pattern.length];
              };

              return (
                <div
                  key={article.id}
                  className={`cursor-pointer transform hover:scale-105 transition-transform duration-200 ${getMasonryClass(idx)}`}
                  onClick={() => navigate(`/article/${article.slug}`)}
                >
                  <ArticleCard article={article as any} size="medium" index={idx} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArticles.map((article, idx) => (
              <div
                key={article.id}
                onClick={() => navigate(`/article/${article.slug}`)}
                className="p-4 border border-rule rounded hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline text-base sm:text-lg md:text-base italic text-ink font-black mb-1 line-clamp-2">
                      {article.translations?.[article.defaultLanguage as keyof typeof article.translations]?.title || article.slug}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-muted-foreground line-clamp-1 mb-2">
                      {article.translations?.[article.defaultLanguage as keyof typeof article.translations]?.excerpt}
                    </p>
                    <div className="flex gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="font-sans-clean tracking-widest uppercase">
                        {article.category}
                      </span>
                      <span>•</span>
                      <span>{article.date}</span>
                      <span>•</span>
                      <span>{article.readingTime} {t('common.readingTime')}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{article.views} {t('common.views')}</span>
                    </div>
                  </div>
                  {(article as any)?.featured && (
                    <div className="mt-2 md:mt-0 inline-block">
                      <span className="font-sans-clean text-[10px] tracking-[0.35em] uppercase px-3 py-1 border border-ink rounded">
                        {t('hero.featured')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center text-sm text-muted-foreground">
        <p>
          {t('articlesPage.showing')} {filteredArticles.length} {t('articlesPage.of')} {articles.length} {t('articlesPage.articlesCount')}
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-ink">
        <div className="border-t border-rule" />
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-headline text-lg font-black text-ink">Nigar Shah</span>
          <span className="font-sans-clean text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            © 2026 · All Rights Reserved · Personal Journal
          </span>
          <span className="font-sans-clean text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            Baku & Beyond
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Articles;
