import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminService, Article } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n";
import { ArrowLeft, TrendingUp, Eye, BarChart3, Languages, Clock, AlertTriangle, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Language = "en" | "az" | "ru" | "tr";

const AdminAnalytics = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language].admin;

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthed = await adminService.verifyToken();
      if (!isAuthed) {
        navigate("/admin/login");
        return;
      }

      const result = await adminService.getAllArticles();
      if (result.success && result.data) {
        // Sort by views descending
        const sorted = (result.data || []).sort((a, b) => (b.views || 0) - (a.views || 0));
        setArticles(sorted);
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  // Calculate analytics
  const totalArticles = articles.length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const avgViewsPerArticle = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;
  
  // Count languages used
  const languageUsage: Record<Language, number> = { en: 0, az: 0, ru: 0, tr: 0 };
  articles.forEach((article) => {
    (Object.keys(article.translations || {}) as Language[]).forEach((lang) => {
      if (article.translations?.[lang]?.title?.trim()) {
        languageUsage[lang]++;
      }
    });
  });

  // Views by category
  const categoryViews: Record<string, number> = {};
  articles.forEach((article) => {
    const category = article.category || "Uncategorized";
    categoryViews[category] = (categoryViews[category] || 0) + (article.views || 0);
  });
  
  const categoryChartData = Object.entries(categoryViews).map(([name, views]) => ({
    name,
    views,
  }));

  // Views timeline (by date)
  const dateViews: Record<string, number> = {};
  articles.forEach((article) => {
    const date = article.date || "Unknown";
    dateViews[date] = (dateViews[date] || 0) + (article.views || 0);
  });
  
  const timelineChartData = Object.entries(dateViews)
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => {
      // Try to parse dates, otherwise keep original order
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return isNaN(dateA) || isNaN(dateB) ? 0 : dateA - dateB;
    });

  // Language distribution pie data
  const languageChartData = (Object.keys(languageUsage) as Language[])
    .filter(lang => languageUsage[lang] > 0)
    .map(lang => ({
      name: lang === "en" ? "English" : lang === "az" ? "Azərbaycanca" : lang === "ru" ? "Русский" : "Türkçe",
      value: languageUsage[lang],
    }));

  const COLORS = ["#000000", "#333333", "#666666", "#999999"];

  // Get top performing articles
  const topArticles = articles.slice(0, 5);

  // Get least viewed articles
  const leastViewedArticles = [...articles].reverse().slice(0, 3);

  const getArticleTitle = (article: Article) => {
    const availableLangs = (Object.keys(article.translations || {}) as Language[])
      .filter(lang => article.translations?.[lang]?.title?.trim());
    return availableLangs.length > 0 
      ? article.translations?.[availableLangs[0]]?.title
      : article.slug;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-24">
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Header */}
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-ink mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t.backToDashboard}
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-ink mb-2">{t.analyticsTitle}</h1>
          <p className="text-muted-foreground text-lg">{t.subtitle}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Total Views */}
          <div className="group border border-rule rounded-xl p-6 bg-card hover:border-ink/30 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground font-sans-clean text-xs tracking-widest uppercase mb-3">
                  {t.totalViews}
                </p>
                <h3 className="text-4xl font-black text-ink">{totalViews.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-ink/10 to-ink/5 rounded-lg group-hover:from-ink/20 group-hover:to-ink/10 transition-all">
                <Eye size={24} className="text-ink" />
              </div>
            </div>
          </div>

          {/* Avg Views */}
          <div className="group border border-rule rounded-xl p-6 bg-card hover:border-ink/30 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground font-sans-clean text-xs tracking-widest uppercase mb-3">
                  {t.avgViews}
                </p>
                <h3 className="text-4xl font-black text-ink">{avgViewsPerArticle.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-ink/10 to-ink/5 rounded-lg group-hover:from-ink/20 group-hover:to-ink/10 transition-all">
                <TrendingUp size={24} className="text-ink" />
              </div>
            </div>
          </div>

          {/* Published Articles */}
          <div className="group border border-rule rounded-xl p-6 bg-card hover:border-ink/30 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground font-sans-clean text-xs tracking-widest uppercase mb-3">
                  {t.totalArticles}
                </p>
                <h3 className="text-4xl font-black text-ink">{totalArticles}</h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-ink/10 to-ink/5 rounded-lg group-hover:from-ink/20 group-hover:to-ink/10 transition-all">
                <BarChart3 size={24} className="text-ink" />
              </div>
            </div>
          </div>

          {/* Languages Used */}
          <div className="group border border-rule rounded-xl p-6 bg-card hover:border-ink/30 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground font-sans-clean text-xs tracking-widest uppercase mb-3">
                  {translations[language].common.views}
                </p>
                <h3 className="text-4xl font-black text-ink">
                  {Object.values(languageUsage).filter(v => v > 0).length}
                </h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-ink/10 to-ink/5 rounded-lg group-hover:from-ink/20 group-hover:to-ink/10 transition-all">
                <Languages size={24} className="text-ink" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {totalArticles > 0 && (
          <>
            {/* Views by Category Chart */}
            {categoryChartData.length > 0 && (
              <div className="border border-rule rounded-xl overflow-hidden bg-card mb-12 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-card to-muted/20 border-b border-rule px-8 py-6">
                  <h2 className="text-xl font-bold text-ink flex items-center gap-3 mb-2">
                    <div className="p-2 bg-ink/10 rounded-lg">
                      <BarChart3 size={20} className="text-ink" />
                    </div>
                    {t.viewsByCategory}
                  </h2>
                  <p className="text-sm text-muted-foreground">{t.totalViewsByCategory}</p>
                </div>
                <div className="p-8">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={categoryChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <defs>
                        <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#000000" stopOpacity={1} />
                          <stop offset="100%" stopColor="#333333" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 12, fill: "#000" }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#000" }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#ffffff", 
                          border: "2px solid #000",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                          color: "#000"
                        }}
                        labelStyle={{ color: "#000", fontWeight: "bold" }}
                        formatter={(value) => [value.toLocaleString(), "Views"]}
                      />
                      <Bar dataKey="views" fill="url(#categoryGradient)" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Views Over Time Chart */}
            {timelineChartData.length > 0 && (
              <div className="border border-rule rounded-xl overflow-hidden bg-card mb-12 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-card to-muted/20 border-b border-rule px-8 py-6">
                  <h2 className="text-xl font-bold text-ink flex items-center gap-3 mb-2">
                    <div className="p-2 bg-ink/10 rounded-lg">
                      <Clock size={20} className="text-ink" />
                    </div>
                    {t.viewsOverTime}
                  </h2>
                  <p className="text-sm text-muted-foreground">{t.articleViewsByDate}</p>
                </div>
                <div className="p-8">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={timelineChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <defs>
                        <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#000000" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis 
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 12, fill: "#000" }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#000" }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#ffffff", 
                          border: "2px solid #000",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                          color: "#000"
                        }}
                        labelStyle={{ color: "#000", fontWeight: "bold" }}
                        formatter={(value) => [value.toLocaleString(), "Views"]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#000000" 
                        strokeWidth={3}
                        dot={{ fill: "#000000", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Language Distribution Chart */}
            {languageChartData.length > 0 && (
              <div className="border border-rule rounded-xl overflow-hidden bg-card mb-12 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-card to-muted/20 border-b border-rule px-8 py-6">
                  <h2 className="text-xl font-bold text-ink flex items-center gap-3 mb-2">
                    <div className="p-2 bg-ink/10 rounded-lg">
                      <Languages size={20} className="text-ink" />
                    </div>
                    {t.languageDistribution}
                  </h2>
                  <p className="text-sm text-muted-foreground">{t.numberOfArticlesByLanguage}</p>
                </div>
                <div className="p-8 flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={languageChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        labelStyle={{ fill: "#000", fontSize: "12px", fontWeight: "bold" }}
                      >
                        {languageChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "2px solid #000",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                          color: "#000"
                        }}
                        labelStyle={{ color: "#000", fontWeight: "bold" }}
                        formatter={(value) => [value.toString(), "Count"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {/* Language Breakdown Table */}
        {totalArticles > 0 && (
          <div className="border border-rule rounded-xl overflow-hidden bg-card mb-12 shadow-lg">
            <div className="bg-gradient-to-r from-card to-muted/20 border-b border-rule px-8 py-6">
              <h2 className="text-xl font-bold text-ink flex items-center gap-3">
                <div className="p-2 bg-ink/10 rounded-lg">
                  <Languages size={20} className="text-ink" />
                </div>
                {t.languageDistribution}
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {(["en", "az", "ru", "tr"] as Language[]).map((lang) => (
                  <div key={lang} className="border border-rule rounded-xl p-6 bg-gradient-to-br from-background to-muted/30 hover:border-ink/20 transition-colors">
                    <p className="text-muted-foreground text-xs uppercase font-sans-clean tracking-wider mb-3">
                      {lang === "en" ? "English" : lang === "az" ? "Azərbaycanca" : lang === "ru" ? "Русский" : "Türkçe"}
                    </p>
                    <h3 className="text-3xl font-black text-ink mb-2">{languageUsage[lang]}</h3>
                    <div className="w-full bg-rule overflow-hidden rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-ink to-ink/70 h-full transition-all duration-300"
                        style={{ width: `${totalArticles > 0 ? (languageUsage[lang] / totalArticles) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {totalArticles > 0 ? Math.round((languageUsage[lang] / totalArticles) * 100) : 0}% of articles
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Performing Articles */}
        {topArticles.length > 0 && (
          <div className="border border-rule rounded-xl overflow-hidden shadow-lg mb-12">
            <div className="bg-gradient-to-r from-card to-muted/20 border-b border-rule px-8 py-6">
              <h2 className="text-lg font-bold text-ink flex items-center gap-3">
                <div className="p-2 bg-ink/10 rounded-lg">
                  <TrendingUp size={20} className="text-ink" />
                </div>
                {t.topPerforming}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t.mostViewed}</p>
            </div>
            <div className="space-y-0 bg-card">
              {topArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="border-t border-rule px-8 py-5 flex items-center justify-between hover:bg-muted/30 transition-colors first:border-t-0"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ink to-ink/80 text-background flex items-center justify-center font-black text-lg">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-ink">{getArticleTitle(article)}</p>
                      <p className="text-sm text-muted-foreground">{article.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-2xl font-black text-ink">{article.views || 0}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Eye size={12} /> {translations[language].common.views}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Least Viewed Articles */}
        {leastViewedArticles.length > 0 && (
          <div className="border border-rule rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-card to-muted/20 border-b border-rule px-8 py-6">
              <h2 className="text-lg font-bold text-ink flex items-center gap-3">
                <div className="p-2 bg-muted/50 rounded-lg">
                  <AlertTriangle size={20} className="text-muted-foreground" />
                </div>
                {t.needsAttention}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t.promoteSuggestion}</p>
            </div>
            <div className="space-y-0 bg-card">
              {leastViewedArticles.map((article) => (
                <div
                  key={article.id}
                  className="border-t border-rule px-8 py-5 flex items-center justify-between hover:bg-muted/30 transition-colors first:border-t-0"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-black text-lg">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-ink">{getArticleTitle(article)}</p>
                      <p className="text-sm text-muted-foreground">{article.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-2xl font-black text-ink">{article.views || 0}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Eye size={12} /> {translations[language].common.views}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalArticles === 0 && (
          <div className="border border-rule rounded-xl p-12 bg-card text-center shadow-lg">
            <div className="p-4 w-fit mx-auto mb-4 bg-muted/50 rounded-xl">
              <Target size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">No Articles Yet</h3>
            <p className="text-muted-foreground mb-6">Create your first article to see analytics</p>
            <Link to="/admin/articles/new">
              <Button>Create Article</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
