import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Seminar, seminarService } from "@/services/seminarService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, Globe, Calendar, Clock, ArrowLeft, Copy, Share2, Check } from "lucide-react";

const SeminarPage = () => {
  const { language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [seminar, setSeminar] = useState<Seminar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [views, setViews] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSeminar = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await seminarService.getBySlug(slug);
        setSeminar(data);
        setViews(data.views || 0);

        // Increment view count
        try {
          const newViewCount = await seminarService.incrementViews(slug);
          setViews(newViewCount);
        } catch {
          // View count increment is not critical
        }

        setError(null);
      } catch (err) {
        setError("Failed to load seminar");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeminar();
  }, [slug, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink"></div>
      </div>
    );
  }

  if (error || !seminar) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => navigate("/seminars")}
            className="flex items-center gap-2 text-ink hover:underline mb-8"
          >
            <ArrowLeft size={20} />
            {language === "az" ? "Seminarlar" : language === "ru" ? "Семинары" : language === "tr" ? "Seminerler" : "Seminars"}
          </button>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            {error || "Seminar not found"}
          </div>
        </div>
      </div>
    );
  }

  const translation = seminar.translations[language as keyof typeof seminar.translations] || seminar.translations.en;
  const startDate = new Date(seminar.startDateTime);
  const endDate = new Date(seminar.endDateTime);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === "en" ? "en-US" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === "en" ? "en-US" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-muted text-ink font-sans-clean text-xs tracking-widest";
      case "completed":
        return "bg-muted text-muted-foreground font-sans-clean text-xs tracking-widest";
      default:
        return "bg-muted text-ink";
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case "online":
        return "bg-muted text-ink font-sans-clean text-xs tracking-widest";
      case "offline":
        return "bg-muted text-ink font-sans-clean text-xs tracking-widest";
      case "hybrid":
        return "bg-muted text-ink font-sans-clean text-xs tracking-widest";
      default:
        return "bg-muted text-ink";
    }
  };

  const getShareUrl = () => {
    return `${window.location.origin}/seminars/${seminar?.slug}`;
  };

  const handleCopyUrl = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <article className="min-h-screen bg-background text-ink pt-16">
      {/* Newspaper Header Bar */}
      <div className="border-b-4 border-ink px-4 py-4 bg-background">
        <div className="container mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/seminars")}
            className="flex items-center gap-2 text-ink hover:opacity-70 text-sm font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            {language === "az" ? "Geri" : language === "ru" ? "Назад" : language === "tr" ? "Geri" : "Back"}
          </button>
          <p className="text-xs uppercase tracking-widest text-ink">
            {formatDate(startDate)}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Masthead Section */}
        <header className="mb-12 pb-8 border-b-2 border-ink">
          {/* Byline and Category */}
          <div className="flex items-center gap-4 mb-6">
            <div className="px-3 py-1 border-2 border-ink text-xs font-bold uppercase tracking-widest">
              {seminar.topic}
            </div>
            <div className="text-xs uppercase tracking-widest text-ink">
              {seminar.status === "upcoming"
                ? language === "az"
                  ? "Yaxındakı"
                  : language === "ru"
                    ? "Предстоящий"
                    : language === "tr"
                      ? "Yaklaşan"
                      : "Upcoming"
                : language === "az"
                  ? "Keçmiş"
                  : language === "ru"
                    ? "Завершённый"
                    : language === "tr"
                      ? "Tamamlanan"
                      : "Completed"} • {seminar.format.charAt(0).toUpperCase() + seminar.format.slice(1)}
            </div>
          </div>

          {/* Main Headline */}
          <h1 
            className="text-5xl md:text-6xl font-bold leading-tight mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {translation.title}
          </h1>

          {/* Decorative Line */}
          <div className="h-1 w-16 bg-ink mb-6"></div>

          {/* Subtitle/Description Preview */}
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
            {translation.description.split('\n')[0]}
          </p>
        </header>

        {/* Cover Image - Full Width */}
        {seminar.coverImage && (
          <div className="mb-12 border-2 border-ink">
            <img
              src={seminar.coverImage}
              alt={translation.title}
              className="w-full h-96 object-cover"
            />
            <p className="text-xs italic p-3 border-t border-ink text-muted-foreground">
              {translation.title}
            </p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Main Article Content - 2 columns */}
          <div className="md:col-span-2">
            {/* Meta Details */}
            <div className="bg-background border-2 border-ink p-6 mb-8">
              <div className="grid grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-ink mb-2">
                    {language === "az" ? "Tarix" : language === "ru" ? "Дата" : language === "tr" ? "Tarih" : "Date"}
                  </p>
                  <p className="text-lg font-bold">{formatDate(startDate)}</p>
                  {formatDate(startDate) !== formatDate(endDate) && (
                    <p className="text-sm text-muted-foreground">
                      {language === "az" ? "dan" : language === "ru" ? "до" : language === "tr" ? "den" : "to"}{" "}
                      {formatDate(endDate)}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-ink mb-2">
                    {language === "az" ? "Saat" : language === "ru" ? "Время" : language === "tr" ? "Saat" : "Time"}
                  </p>
                  <p className="text-lg font-bold">
                    {formatTime(startDate)}
                    {formatTime(startDate) !== formatTime(endDate) && ` - ${formatTime(endDate)}`}
                  </p>
                </div>

                {/* Location */}
                {(seminar.format === "offline" || seminar.format === "hybrid") && seminar.location && (
                  <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-ink mb-2">
                      {language === "az" ? "Yer" : language === "ru" ? "Место" : language === "tr" ? "Yer" : "Location"}
                    </p>
                    <p className="text-lg font-bold">{seminar.location}</p>
                  </div>
                )}

                {/* Platform */}
                {(seminar.format === "online" || seminar.format === "hybrid") && seminar.platformLink && (
                  <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-ink mb-2">
                      {language === "az" ? "Platform" : language === "ru" ? "Платформа" : language === "tr" ? "Platform" : "Platform"}
                    </p>
                    <a
                      href={seminar.platformLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ink hover:underline break-all"
                    >
                      {new URL(seminar.platformLink).hostname}
                    </a>
                  </div>
                )}

                {/* Views */}
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
                    {language === "az" ? "Baxışlar" : language === "ru" ? "Просмотры" : language === "tr" ? "Görüntüleme" : "Views"}
                  </p>
                  <p className="text-lg font-bold">{views}</p>
                </div>
              </div>
            </div>

            {/* Article Text */}
            <div className="text-lg leading-relaxed whitespace-pre-wrap mb-8 text-justify">
              {translation.description}
            </div>

            {/* Registration Button - Prominent */}
            {seminar.registrationLink && (
              <div className="border-2 border-ink p-6 bg-muted/20 mb-8">
                <p className="text-sm uppercase tracking-widest font-bold mb-4">
                  {language === "az"
                    ? "Seminara qatılmaq üçün"
                    : language === "ru"
                      ? "Зарегистрироваться на семинар"
                      : language === "tr"
                        ? "Seminere katılmak için"
                        : "Register for this seminar"}
                </p>
                <a href={seminar.platformLink || seminar.registrationLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full md:w-auto bg-ink hover:bg-ink/90 text-paper px-8 py-4 font-bold text-lg uppercase tracking-wide">
                    {language === "az"
                      ? "Qeydiyyatdan keç"
                      : language === "ru"
                        ? "Зарегистрироваться"
                        : language === "tr"
                          ? "Kaydol"
                          : "Register Now"}
                  </Button>
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-1">
            {/* Quick Facts Box */}
            <div className="border-2 border-ink p-6 mb-8 sticky top-8">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 pb-3 border-b-2 border-ink">
                {language === "az"
                  ? "Tez Məlumat"
                  : language === "ru"
                    ? "Краткие факты"
                    : language === "tr"
                      ? "Hızlı Bilgiler"
                      : "Quick Facts"}
              </h3>

              <ul className="space-y-4 text-sm">
                <li>
                  <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                    {language === "az"
                      ? "Format"
                      : language === "ru"
                        ? "Формат"
                        : language === "tr"
                          ? "Format"
                          : "Format"}
                  </p>
                  <p className="font-bold mt-1">
                    {seminar.format === "online"
                      ? language === "az"
                        ? "Onlayn"
                        : language === "ru"
                          ? "Онлайн"
                          : language === "tr"
                            ? "Çevrimiçi"
                            : "Online"
                      : seminar.format === "offline"
                        ? language === "az"
                          ? "Şəxsən"
                          : language === "ru"
                            ? "Очно"
                            : language === "tr"
                              ? "Yüz yüze"
                              : "In-Person"
                        : language === "az"
                          ? "Hibrid"
                          : language === "ru"
                            ? "Гибридный"
                            : language === "tr"
                              ? "Hibrit"
                              : "Hybrid"}
                  </p>
                </li>

                <li>
                  <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                    {language === "az"
                      ? "Hal-hazırkı status"
                      : language === "ru"
                        ? "Статус"
                        : language === "tr"
                          ? "Durum"
                          : "Status"}
                  </p>
                  <p className="font-bold mt-1">
                    {seminar.status === "upcoming"
                      ? language === "az"
                        ? "Yaxındakı"
                        : language === "ru"
                          ? "Предстоящий"
                          : language === "tr"
                            ? "Yaklaşan"
                            : "Upcoming"
                      : language === "az"
                        ? "Keçmiş"
                        : language === "ru"
                          ? "Завершённый"
                          : language === "tr"
                            ? "Tamamlanan"
                            : "Completed"}
                  </p>
                </li>

                <li>
                  <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                    {language === "az"
                      ? "Mövzu"
                      : language === "ru"
                        ? "Тема"
                        : language === "tr"
                          ? "Konu"
                          : "Topic"}
                  </p>
                  <p className="font-bold mt-1">{seminar.topic}</p>
                </li>
              </ul>
            </div>

            {/* Share & Invite Section */}
            <div className="border-2 border-ink p-6 mb-8">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 pb-3 border-b-2 border-ink">
                {language === "az"
                  ? "Dəvət Et & Paylaş"
                  : language === "ru"
                    ? "Пригласить и поделиться"
                    : language === "tr"
                      ? "Davet Et & Paylaş"
                      : "Invite & Share"}
              </h3>

              <p className="text-xs text-muted-foreground mb-3">
                {language === "az"
                  ? "Bu URL-i paylaş, digərləri burada mövcud olan seminar məlumatını görsün"
                  : language === "ru"
                    ? "Поделитесь этой ссылкой, чтобы другие могли просмотреть информацию о семинаре"
                    : language === "tr"
                      ? "Bu linki paylaş, diğer kişiler seminer bilgilerini görsün"
                      : "Share this link so others can preview the seminar"}
              </p>

              {/* URL Display Box */}
              <div className="bg-paper border-2 border-rule rounded p-3 mb-3 flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={getShareUrl()}
                  readOnly
                  className="flex-1 bg-transparent text-xs text-ink focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1 px-3 py-2 bg-muted hover:bg-muted/80 text-ink rounded text-xs font-semibold uppercase tracking-widest transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      {language === "az"
                        ? "Kopyalandı"
                        : language === "ru"
                          ? "Скопировано"
                          : language === "tr"
                            ? "Kopyalandı"
                            : "Copied"}
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      {language === "az"
                        ? "Kopyala"
                        : language === "ru"
                          ? "Копировать"
                          : language === "tr"
                            ? "Kopyala"
                            : "Copy"}
                    </>
                  )}
                </button>
              </div>

              {/* Share Info */}
              <p className="text-xs text-muted-foreground">
                {language === "az"
                  ? "Alıcılar bu linkə daxil olmaqla seminarın preview'ni görəcəklər"
                  : language === "ru"
                    ? "Получатели увидят предпросмотр семинара при переходе по этой ссылке"
                    : language === "tr"
                      ? "Alıcılar bu linke tıklandığında seminer önizlemesini görecekler"
                      : "Recipients will see a preview of the seminar when they click this link"}
              </p>
            </div>

            {/* Related Info */}
            <div className="border border-rule p-4 text-xs text-muted-foreground">
              <p>
                {language === "az"
                  ? "Bu seminar Nigar tərəfindən təşkil edilib. Daha ətraflı məlumat üçün seminar səhifəsinə dönün."
                  : language === "ru"
                    ? "Этот семинар организован Нигар. Вернитесь на страницу семинаров для получения дополнительной информации."
                    : language === "tr"
                      ? "Bu seminer Nigar tarafından düzenlenmiştir. Daha fazla bilgi için seminer sayfasına dönün."
                      : "This seminar is organized by Nigar. Return to the seminars page for more information."}
              </p>
            </div>
          </aside>
        </div>

        {/* Footer Navigation */}
        <div className="border-t-4 border-ink pt-8">
          <Link to="/seminars" className="inline-flex items-center gap-2 text-ink hover:opacity-70 font-bold uppercase tracking-widest text-sm">
            ← {language === "az" ? "Bütün seminarları gör" : language === "ru" ? "Все семинары" : language === "tr" ? "Tüm seminerleri gör" : "View all seminars"}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default SeminarPage;
