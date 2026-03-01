import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n";
import { adminService } from "@/services/adminService";
import { markdownToHtml } from "@/lib/markdown";
import nigarAvatar from "@/assets/nigar-avatar.png";

type Language = "en" | "az" | "ru" | "tr";

interface SocialMedia {
  instagram?: string;
  threads?: string;
  medium?: string;
  facebook?: string;
  linkedin?: string;
}

const About = () => {
  const { language } = useLanguage();
  const [aboutContent, setAboutContent] = useState<{ title?: string; content?: string } | null>(null);
  const [aboutImage, setAboutImage] = useState<string | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[language].aboutPage;

  // Default fallback content per language
  const defaultContent: Record<Language, { title: string; content: string }> = {
    en: {
      title: "On the Art of Paying Attention",
      content: `I write to understand. Not to explain, not to persuade — to understand. The essay is my natural form: it circles, it questions, it arrives somewhere unexpected. I am less interested in conclusions than in the quality of attention that precedes them.

I was born in Baku, raised between languages, and educated in the literature of several traditions. I have lived in various cities, but something in me remains perpetually Azerbaijani: rooted in a particular light, a particular salt wind off the Caspian, a particular way of holding things.

I write about language and its limits. About grief as a form of intelligence. About cities, winter, the private lives of books. About the things we almost say.

*This journal is my working notebook — made public.*`,
    },
    az: {
      title: "Diqqət Sənətinin Üzərində",
      content: `Anlamaq üçün yazıram. Izah etmək üçün deyil, inandırmaq üçün deyil — anlamaq üçün. Essay mənim natural formamdır: dövürür, sual verir, gözlənilməz yerə çatır. Mən nəticələrdən daha çox onları əvvəl gələn diqqətin keyfiyyətində maraqlıyam.

Bakıda doğuldum, bir neçə dil arasında böyüdüm və bir neçə ənənənin ədəbiyyatında təhsil aldım. Müxtəlif şəhərlərdə yaşadığım olsa da, bənim içimdə bir şey həmişə Azərbaycanlı qalır: xüsusi bir işığa, Xəzər dənizinin xüsusi duz rüzğarına, şeyləri tutuş xüsusi üsula kökləşib.

Dil və onun hədləri haqqında yazıram. Kədəri intellekt forması kimi. Şəhərlər, qış, kitabların xüsusi həyatları haqqında. Demədiyimiz şeylər haqqında.

*Bu jurnal mənim işçi dəftərim — ictimai həyatda.*`,
    },
    ru: {
      title: "Об искусстве внимания",
      content: `Я пишу, чтобы понять. Не объяснить, не убедить — понять. Эссе — моя естественная форма: оно кружится, задает вопросы, приходит куда-то неожиданное. Меня интересует не столько выводы, сколько качество внимания, которое им предшествует.

Я родилась в Баку, выросла между языками и получила образование в литературе нескольких традиций. Я жила в разных городах, но что-то во мне остается навеки азербайджанским: укорененным в особенном свете, в особенном соленом ветре с Каспия, в особенном способе держать вещи.

Я пишу о языке и его границах. О горе как форме интеллекта. О городах, зиме, частной жизни книг. О том, что мы почти говорим.

*Этот журнал — мой рабочий блокнот, выставленный на обозрение.*`,
    },
    tr: {
      title: "Dikkat Sanatı Üzerine",
      content: `Anlamak için yazarım. Açıklamak için değil, ikna etmek için değil — anlamak için. Deneme benim doğal formum: dolaşır, sorar, beklenmedik bir yere ulaşır. Sonuçlar yerine onlardan önceki dikkat kalitesiyle ilgilenirim.

Bakı'da doğdum, çeşitli diller arasında büyüdüm ve birkaç geleneğin edebiyatında eğitim aldım. Çeşitli şehirlerde yaşamış olsam da, içimde bir şey daima Azerbaycanlı kalıyor: belirli bir ışığa, Hazar'dan gelen belirli bir tuzlu rüzgara, şeyleri tutmanın belirli bir biçimine köklenmiş.

Dil ve sınırları hakkında yazarım. Zeka biçimi olarak 1yas hakkında. Şehirler, kış, kitapların özel yaşamları hakkında. Neredeyse söylediğimiz şeyler hakkında.

*Bu dergi benim çalışma not defterim — kamuya açık.*`,
    },
  };

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const result = await adminService.getSettings();
        if (result.success && result.data?.about) {
          const langData = result.data.about[language as Language];
          if (langData?.title && langData?.content) {
            setAboutContent(langData);
          } else {
            setAboutContent(defaultContent[language as Language]);
          }
          if (result.data.aboutImage) {
            setAboutImage(result.data.aboutImage);
          }
          if (result.data.socialMedia) {
            setSocialMedia(result.data.socialMedia);
          }
        } else {
          setAboutContent(defaultContent[language as Language]);
        }
      } catch (error) {
        console.error("Error fetching about settings:", error);
        setAboutContent(defaultContent[language as Language]);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, [language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const content = aboutContent || defaultContent[language as Language];

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Header rule */}
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <div className="rule-top pt-4">
          <div className="flex items-center justify-between">
            <span className="font-sans-clean text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              {t.headerAbout}
            </span>
            <span className="font-sans-clean text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              {t.headerWriter}
            </span>
          </div>
          <div className="h-px bg-rule mt-1" />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-start">
          {/* Portrait column */}
          <div className="fade-up pr-0 md:pr-12 border-b md:border-b-0 md:border-r border-rule pb-12 md:pb-0">
            <div className="relative grain-overlay bg-foreground overflow-hidden aspect-[3/4] max-w-xs mx-auto md:mx-0">
              <img
                src={aboutImage || nigarAvatar}
                alt="Nigar Shah"
                className="w-full h-full object-cover object-top grayscale contrast-110 mix-blend-luminosity"
                style={{ filter: "grayscale(100%) contrast(1.1) brightness(0.95)" }}
              />
              {/* Dramatic overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              {/* Name over image */}
              <div className="absolute bottom-6 left-6">
                <span className="font-headline text-lg sm:text-xl md:text-2xl font-black text-paper">Nigar Shah</span>
              </div>
            </div>

            {/* Caption */}
            <div className="mt-4 max-w-xs mx-auto md:mx-0">
              <p className="font-sans-clean text-[10px] tracking-[0.2em] uppercase text-muted-foreground border-t border-rule pt-3">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Bio column */}
          <div
            className="fade-up pl-0 md:pl-12 pt-12 md:pt-0"
            style={{ animationDelay: "0.15s" }}
          >
            {/* Headline */}
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-ink mb-6">
              {content.title}
            </h1>

            <div className="h-px bg-ink mb-6" />

            {/* Bio content */}
            <div
              className="space-y-4 text-base sm:text-lg leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(content.content || ""),
              }}
            />

            <div className="h-px bg-rule mt-8 mb-6" />

            {/* Social / contact */}
            <div className="space-y-2 sm:space-y-3">
              <p className="font-sans-clean text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-3">
                Find Me
              </p>
              {socialMedia && (
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {socialMedia.instagram && (
                    <a
                      href={socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ink-link font-sans-clean text-xs tracking-[0.2em] uppercase text-ink hover:text-muted-foreground transition-colors"
                    >
                      Instagram →
                    </a>
                  )}
                  {socialMedia.threads && (
                    <a
                      href={socialMedia.threads}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ink-link font-sans-clean text-xs tracking-[0.2em] uppercase text-ink hover:text-muted-foreground transition-colors"
                    >
                      Threads →
                    </a>
                  )}
                  {socialMedia.medium && (
                    <a
                      href={socialMedia.medium}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ink-link font-sans-clean text-xs tracking-[0.2em] uppercase text-ink hover:text-muted-foreground transition-colors"
                    >
                      Medium →
                    </a>
                  )}
                  {socialMedia.facebook && (
                    <a
                      href={socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ink-link font-sans-clean text-xs tracking-[0.2em] uppercase text-ink hover:text-muted-foreground transition-colors"
                    >
                      Facebook →
                    </a>
                  )}
                  {socialMedia.linkedin && (
                    <a
                      href={socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ink-link font-sans-clean text-xs tracking-[0.2em] uppercase text-ink hover:text-muted-foreground transition-colors"
                    >
                      LinkedIn →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pull quote */}
      <div className="border-y-2 border-ink py-12 sm:py-16 mb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="fade-up">
            <p className="font-headline text-2xl sm:text-4xl md:text-5xl italic font-bold leading-tight text-ink mb-6">
              "{t.pullQuoteLine1}
              <br />
              {t.pullQuoteLine2}"
            </p>
            <span className="font-sans-clean text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
              — {t.pullQuoteAuthor}
            </span>
          </div>
        </div>
      </div>

      {/* Back to journal */}
      <div className="max-w-4xl mx-auto px-6 mb-16 text-center">
        <Link
          to="/"
          className="inline-block font-sans-clean text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-ink border border-ink px-6 sm:px-8 py-2 sm:py-3 hover:bg-ink hover:text-paper transition-colors duration-300"
        >
          Read the Journal
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

export default About;
