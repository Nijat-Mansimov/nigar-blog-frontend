import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Seminar, seminarService } from "@/services/seminarService";
import { SeminarCard } from "@/components/SeminarCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Globe, Search, Grid, List } from "lucide-react";
import { Link } from "react-router-dom";

const Seminars = () => {
  const { language, t } = useLanguage();
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchSeminars = async () => {
      try {
        setLoading(true);
        const data = await seminarService.getAll();
        setSeminars(data);
        setError(null);
      } catch (err) {
        setError("Failed to load seminars");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeminars();
  }, []);

  const filterSeminars = (seminar: Seminar): boolean => {
    // Filter by format
    if (selectedFormat !== "All" && seminar.format !== selectedFormat.toLowerCase()) {
      return false;
    }

    // Filter by search query in title and description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const translation = seminar.translations[language as keyof typeof seminar.translations] || seminar.translations.en;
      const matchesTitle = translation.title.toLowerCase().includes(query);
      const matchesDescription = translation.description.toLowerCase().includes(query);
      const matchesTopic = seminar.topic.toLowerCase().includes(query);
      
      if (!matchesTitle && !matchesDescription && !matchesTopic) {
        return false;
      }
    }

    return true;
  };

  const upcomingSeminars = seminars
    .filter((s) => s.status === "upcoming")
    .filter((s) => filterSeminars(s));
  const completedSeminars = seminars
    .filter((s) => s.status === "completed")
    .filter((s) => filterSeminars(s));
  const allFilteredSeminars = [...upcomingSeminars, ...completedSeminars];

  return (
    <div className="min-h-screen bg-background text-ink pt-24">
      {/* Masthead */}
      <div className="max-w-7xl mx-auto px-6 pb-4">
        <div className="rule-top pt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans-clean text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              {t('seminarsPage.professionalCourses')}
            </span>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-12 h-px bg-rule" />
              <span className="font-sans-clean text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                {t('seminarsPage.title')}
              </span>
              <div className="w-12 h-px bg-rule" />
            </div>
            <span className="font-sans-clean text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              {seminars.length} {t('seminarsPage.seminar')}
            </span>
          </div>
          <div className="h-px bg-ink" />
        </div>
      </div>

      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl italic font-black text-ink mb-3">
          {t('seminarsPage.title')}
        </h1>
        <p className="font-sans text-base sm:text-lg text-muted-foreground max-w-2xl">
          {t('seminarsPage.subtitle')}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Error State */}
        {error && (
          <div className="bg-red-100 border-2 border-red-700 text-red-900 px-6 py-4 mb-8">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
        ) : seminars.length === 0 ? (
          <div className="text-center py-12 border-2 border-ink p-8 bg-background">
            <p className="text-ink text-lg">{t('seminarsPage.noSeminars')}</p>
          </div>
        ) : (
          <>
            {/* Filters and Controls */}
            <div className="space-y-4 mb-8">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('seminarsPage.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Format Filter and View Mode */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Format Filters */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setSelectedFormat("All")}
                    variant={selectedFormat === "All" ? "default" : "outline"}
                    size="sm"
                    className="font-sans-clean tracking-widest"
                  >
                    All
                  </Button>
                  <Button
                    onClick={() => setSelectedFormat("Online")}
                    variant={selectedFormat === "Online" ? "default" : "outline"}
                    size="sm"
                    className="font-sans-clean tracking-widest"
                  >
                    Online
                  </Button>
                  <Button
                    onClick={() => setSelectedFormat("Offline")}
                    variant={selectedFormat === "Offline" ? "default" : "outline"}
                    size="sm"
                    className="font-sans-clean tracking-widest"
                  >
                    Offline
                  </Button>
                  <Button
                    onClick={() => setSelectedFormat("Hybrid")}
                    variant={selectedFormat === "Hybrid" ? "default" : "outline"}
                    size="sm"
                    className="font-sans-clean tracking-widest"
                  >
                    Hybrid
                  </Button>
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

            {/* Content based on view mode */}
            {viewMode === "grid" ? (
              // Grid View - Newspaper Style
              <div className="max-w-7xl mx-auto px-6">
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent border-b-2 border-rule rounded-none">
                    <TabsTrigger 
                      value="upcoming" 
                      className="rounded-none border-b-4 border-transparent data-[state=active]:border-ink data-[state=active]:bg-transparent data-[state=active]:text-ink font-bold text-lg"
                    >
                      {t('seminarsPage.upcoming')}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="completed" 
                      className="rounded-none border-b-4 border-transparent data-[state=active]:border-ink data-[state=active]:bg-transparent data-[state=active]:text-ink font-bold text-lg"
                    >
                      {t('seminarsPage.completed')}
                    </TabsTrigger>
                  </TabsList>

                  {/* Upcoming Seminars - Newspaper Style */}
                  <TabsContent value="upcoming">
                    {upcomingSeminars.length === 0 ? (
                      <div className="text-center py-12 border-2 border-rule p-8 bg-muted/20">
                        <p className="text-muted-foreground">{t('seminarsPage.noSeminars')}</p>
                      </div>
                    ) : (
                      <div>
                        {/* Featured Seminar */}
                        {upcomingSeminars[0] && (
                          <FeaturedSeminarCard 
                            seminar={upcomingSeminars[0]} 
                            language={language}
                          />
                        )}

                        {/* Other Seminars in Columns */}
                        {upcomingSeminars.length > 1 && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t-2 border-rule">
                            {upcomingSeminars.slice(1).map((seminar) => (
                              <SeminarNewspaperCard 
                                key={seminar.id} 
                                seminar={seminar}
                                language={language}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* Completed Seminars - Newspaper Style */}
                  <TabsContent value="completed">
                    {completedSeminars.length === 0 ? (
                      <div className="text-center py-12 border-2 border-rule p-8 bg-muted/20">
                        <p className="text-muted-foreground">{t('seminarsPage.noSeminars')}</p>
                      </div>
                    ) : (
                      <div>
                        {/* Featured Seminar */}
                        {completedSeminars[0] && (
                          <FeaturedSeminarCard 
                            seminar={completedSeminars[0]}
                            language={language}
                          />
                        )}

                        {/* Other Seminars in Columns */}
                        {completedSeminars.length > 1 && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t-2 border-rule">
                            {completedSeminars.slice(1).map((seminar) => (
                              <SeminarNewspaperCard 
                                key={seminar.id} 
                                seminar={seminar}
                                language={language}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              // List View - Single Column
              <div className="max-w-7xl mx-auto px-6">
                {allFilteredSeminars.length === 0 ? (
                  <div className="text-center py-12 border-2 border-rule p-8 bg-muted/20">
                    <p className="text-muted-foreground">{t('seminarsPage.noSeminars')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allFilteredSeminars.map((seminar) => (
                      <SeminarListCard 
                        key={seminar.id} 
                        seminar={seminar}
                        language={language}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Featured Seminar Card Component
const FeaturedSeminarCard = ({ seminar, language }: { seminar: Seminar; language: string }) => {
  const translation = seminar.translations[language as keyof typeof seminar.translations] || seminar.translations.en;
  const startDate = new Date(seminar.startDateTime);

  return (
    <Link to={`/seminars/${seminar.slug}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b-4 border-ink pb-8">
        {/* Featured Image */}
        <div className="md:col-span-2">
          {seminar.coverImage && (
            <img 
              src={seminar.coverImage} 
              alt={translation.title}
              className="w-full aspect-video object-cover border-2 border-ink"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
              {seminar.topic}
            </p>
            <h2 className="text-3xl font-bold leading-tight mb-3" style={{ fontFamily: "Georgia, serif" }}>
              {translation.title}
            </h2>
            <p className="text-sm leading-relaxed mb-4 line-clamp-4">
              {translation.description}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{startDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              {seminar.format === "online" ? (
                <Globe size={14} />
              ) : (
                <MapPin size={14} />
              )}
              <span>{seminar.format}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Newspaper Style Seminar Card
const SeminarNewspaperCard = ({ seminar, language }: { seminar: Seminar; language: string }) => {
  const translation = seminar.translations[language as keyof typeof seminar.translations] || seminar.translations.en;
  const startDate = new Date(seminar.startDateTime);

  return (
    <Link to={`/seminars/${seminar.slug}`} className="hover:opacity-80 transition-opacity">
      <article className="border-2 border-rule p-4">
        {seminar.coverImage && (
          <img 
            src={seminar.coverImage} 
            alt={translation.title}
            className="w-full aspect-video object-cover border border-rule mb-4"
          />
        )}
        
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
          {seminar.topic}
        </p>
        
        <h3 className="text-xl font-bold leading-tight mb-2" style={{ fontFamily: "Georgia, serif" }}>
          {translation.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {translation.description}
        </p>

        <div className="flex items-center gap-4 text-xs border-t border-rule pt-2">
          <span className="font-bold">{startDate.toLocaleDateString()}</span>
          <span className="uppercase tracking-wide">{seminar.format}</span>
        </div>
      </article>
    </Link>
  );
};

// List View Seminar Card
const SeminarListCard = ({ seminar, language }: { seminar: Seminar; language: string }) => {
  const translation = seminar.translations[language as keyof typeof seminar.translations] || seminar.translations.en;
  const startDate = new Date(seminar.startDateTime);
  const isCompleted = startDate < new Date();

  return (
    <Link to={`/seminars/${seminar.slug}`} className="hover:opacity-80 transition-opacity">
      <article className="border-2 border-rule p-6 flex gap-6">
        {/* Image */}
        {seminar.coverImage && (
          <div className="w-40 h-32 flex-shrink-0">
            <img 
              src={seminar.coverImage} 
              alt={translation.title}
              className="w-full h-full object-cover border border-rule"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                {seminar.topic}
              </p>
              {isCompleted && (
                <span className="text-xs uppercase tracking-widest px-2 py-1 border border-ink text-ink">
                  Completed
                </span>
              )}
            </div>
            
            <h3 className="text-2xl font-bold leading-tight mb-2" style={{ fontFamily: "Georgia, serif" }}>
              {translation.title}
            </h3>
            
            <p className="text-sm text-muted-foreground">
              {translation.description}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs border-t border-rule pt-4 mt-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span className="font-bold">{startDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              {seminar.format === "online" ? (
                <Globe size={14} />
              ) : (
                <MapPin size={14} />
              )}
              <span className="uppercase tracking-wide">{seminar.format}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default Seminars;
