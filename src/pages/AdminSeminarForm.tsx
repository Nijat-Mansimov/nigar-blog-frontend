import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Seminar, seminarService } from "@/services/seminarService";
import { adminService } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { AlertCircle, Image as ImageIcon, ArrowLeft } from "lucide-react";

interface TranslationData {
  en: { title: string; description: string };
  az: { title: string; description: string };
  ru: { title: string; description: string };
  tr: { title: string; description: string };
}

const AdminSeminarForm = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(!!id || true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    topic: "",
    startDateTime: "",
    endDateTime: "",
    format: "online" as "online" | "offline" | "hybrid",
    location: "",
    platformLink: "",
    registrationLink: "",
    status: "upcoming" as "upcoming" | "completed",
    published: false,
    defaultLanguage: "az",
    translations: {
      en: { title: "", description: "" },
      az: { title: "", description: "" },
      ru: { title: "", description: "" },
      tr: { title: "", description: "" },
    } as TranslationData,
    coverImage: "",
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    const loadSeminar = async () => {
      try {
        const isAuthed = await adminService.verifyToken();
        if (!isAuthed) {
          navigate("/admin/login");
          return;
        }

        if (id) {
          setLoading(true);
          const token = adminService.getAccessToken();
          if (!token) {
            navigate("/admin/login");
            return;
          }
          const seminar = await seminarService.getById(id, token);
          setFormData({
            slug: seminar.slug,
            topic: seminar.topic,
            startDateTime: new Date(seminar.startDateTime).toISOString().slice(0, 16),
            endDateTime: new Date(seminar.endDateTime).toISOString().slice(0, 16),
            format: seminar.format,
            location: seminar.location || "",
            platformLink: seminar.platformLink || "",
            registrationLink: seminar.registrationLink || "",
            status: seminar.status,
            published: seminar.published,
            defaultLanguage: seminar.defaultLanguage || "az",
            translations: seminar.translations,
            coverImage: seminar.coverImage || "",
          });
          if (seminar.coverImage) {
            setImagePreview(seminar.coverImage);
          }
        }
      } catch (err) {
        setError("Failed to load seminar");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSeminar();
  }, [id, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTranslationChange = (lang: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang as keyof TranslationData],
          [field]: value,
        },
      },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = adminService.getAccessToken();
    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      setImageLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const result = await seminarService.uploadImage(base64, token);
        setFormData((prev) => ({
          ...prev,
          coverImage: result.url,
        }));
        setImagePreview(result.url);
        setError(null);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to upload image");
      console.error(err);
    } finally {
      setImageLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.slug || !formData.topic || !formData.startDateTime || !formData.endDateTime) {
      setError("Please fill in all required fields");
      return false;
    }

    if ((formData.format === "offline" || formData.format === "hybrid") && !formData.location) {
      setError("Location is required for offline or hybrid seminars");
      return false;
    }

    if ((formData.format === "online" || formData.format === "hybrid") && !formData.platformLink) {
      setError("Platform link is required for online or hybrid seminars");
      return false;
    }

    // Check at least one translation
    let hasValidTranslation = false;
    for (const lang of ["en", "az", "ru", "tr"]) {
      const trans = formData.translations[lang as keyof TranslationData];
      if (trans.title && trans.description) {
        hasValidTranslation = true;
        break;
      }
    }

    if (!hasValidTranslation) {
      setError("At least one complete translation (title + description) is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const token = adminService.getAccessToken();
    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (id) {
        await seminarService.update(id, formData, token);
        toast({
          title: "Success",
          description: language === "az"
            ? "Seminar uğurla güncəlləndi"
            : language === "ru"
              ? "Семинар успешно обновлён"
              : language === "tr"
                ? "Seminer başarıyla güncellendi"
                : "Seminar updated successfully",
        });
      } else {
        await seminarService.create(formData, token);
        toast({
          title: "Success",
          description: language === "az"
            ? "Seminar uğurla yaradıldı"
            : language === "ru"
              ? "Семинар успешно создан"
              : language === "tr"
                ? "Seminer başarıyla oluşturuldu"
                : "Seminar created successfully",
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/seminars");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save seminar");
      toast({
        title: "Error",
        description: err.message || "Failed to save seminar",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {/* Header */}
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-ink mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t('admin.backToDashboard')}
        </Link>

        <h1 className="text-4xl md:text-5xl font-black text-ink mb-2">
          {id ? t('admin.editSeminar') : t('admin.createSeminar')}
        </h1>
        <p className="text-muted-foreground mb-8">
          {id
            ? language === "az"
              ? "Mövcud seminarı redaktə edin"
              : language === "ru"
                ? "Отредактируйте существующий семинар"
                : language === "tr"
                  ? "Mevcut semineri düzenleyin"
                  : "Edit an existing seminar"
            : language === "az"
              ? "Yeni seminar əlavə edin"
              : language === "ru"
                ? "Добавить новый семинар"
                : language === "tr"
                  ? "Yeni seminer ekleyin"
                  : "Add a new seminar"}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 flex gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
            {t('admin.seminarCreated')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card className="p-6 bg-background border-2 border-ink">
            <h2 className="text-xl font-bold text-ink mb-4">
              {t('admin.basicInformation')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  {t('admin.slug')} *
                </label>
                <Input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="my-seminar"
                  className="bg-muted/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  {t('admin.topic')} *
                </label>
                <Input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleInputChange("topic", e.target.value)}
                  placeholder="Business, Technology, etc."
                  className="bg-muted/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  {language === "az"
                    ? "Başlanğıc Tarixi/Saatı *"
                    : language === "ru"
                      ? "Дата/время начала *"
                      : language === "tr"
                        ? "Başlangıç Tarihi/Saati *"
                        : "Start Date/Time *"}
                </label>
                <Input
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) => handleInputChange("startDateTime", e.target.value)}
                  className="bg-muted/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  {language === "az"
                    ? "Bitmə Tarixi/Saatı *"
                    : language === "ru"
                      ? "Дата/время окончания *"
                      : language === "tr"
                        ? "Bitiş Tarihi/Saati *"
                        : "End Date/Time *"}
                </label>
                <Input
                  type="datetime-local"
                  value={formData.endDateTime}
                  onChange={(e) => handleInputChange("endDateTime", e.target.value)}
                  className="bg-muted/50"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Format & Location */}
          <Card className="p-6 bg-background border-2 border-ink">
            <h2 className="text-xl font-bold text-ink mb-4">
              {language === "az"
                ? "Format & Mövqe"
                : language === "ru"
                  ? "Формат и местоположение"
                  : language === "tr"
                    ? "Format & Konum"
                    : "Format & Location"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  {language === "az"
                    ? "Format *"
                    : language === "ru"
                      ? "Формат *"
                      : language === "tr"
                        ? "Format *"
                        : "Format *"}
                </label>
                <Select value={formData.format} onValueChange={(value: any) => handleInputChange("format", value)}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.format === "offline" || formData.format === "hybrid") && (
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    {language === "az"
                      ? "Yer"
                      : language === "ru"
                        ? "Место"
                        : language === "tr"
                          ? "Yer"
                          : "Location"}
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, Venue Name"
                    className="bg-muted/50"
                  />
                </div>
              )}
            </div>

            {(formData.format === "online" || formData.format === "hybrid") && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ink mb-2">
                  {language === "az"
                    ? "Platform Linki"
                    : language === "ru"
                      ? "Ссылка на платформу"
                      : language === "tr"
                        ? "Platform Linki"
                        : "Platform Link"}
                </label>
                <Input
                  type="url"
                  value={formData.platformLink}
                  onChange={(e) => handleInputChange("platformLink", e.target.value)}
                  placeholder="https://zoom.us/..."
                  className="bg-muted/50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                {language === "az"
                  ? "Qeydiyyat Linki"
                  : language === "ru"
                    ? "Ссылка на регистрацию"
                    : language === "tr"
                      ? "Kayıt Linki"
                      : "Registration Link"}
              </label>
              <Input
                type="url"
                value={formData.registrationLink}
                onChange={(e) => handleInputChange("registrationLink", e.target.value)}
                placeholder="https://..."
                className="bg-muted/50"
              />
            </div>
          </Card>

          {/* Cover Image */}
          <Card className="p-6 bg-background border-2 border-ink">
            <h2 className="text-xl font-bold text-ink mb-4">
              {language === "az"
                ? "Kapaklı Şəkil"
                : language === "ru"
                  ? "Изображение обложки"
                  : language === "tr"
                    ? "Kapak Resmi"
                    : "Cover Image"}
            </h2>

            {imagePreview && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
              </div>
            )}

            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-ink rounded-lg p-6 cursor-pointer hover:bg-muted/30">
              <ImageIcon size={24} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                {imageLoading
                  ? language === "az"
                    ? "Yükləmə..."
                    : language === "ru"
                      ? "Загрузка..."
                      : language === "tr"
                        ? "Yükleniyor..."
                        : "Uploading..."
                  : language === "az"
                    ? "Şəkil Seçin"
                    : language === "ru"
                      ? "Выберите изображение"
                      : language === "tr"
                        ? "Resim Seçin"
                        : "Select Image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={imageLoading}
                className="hidden"
              />
            </label>
          </Card>

          {/* Translations */}
          <div className="space-y-4">
            {(["en", "az", "ru", "tr"] as const).map((lang) => (
              <Card key={lang} className="p-6 bg-background border-2 border-ink">
                <h2 className="text-lg font-bold text-ink mb-4">
                  {language === "az"
                    ? `${lang.toUpperCase()} Tərcüməsi`
                    : language === "ru"
                      ? `Перевод на ${lang.toUpperCase()}`
                      : language === "tr"
                        ? `${lang.toUpperCase()} Çevirisi`
                        : `${lang.toUpperCase()} Translation`}
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-ink mb-2">
                    {language === "az"
                      ? "Başlıq"
                      : language === "ru"
                        ? "Название"
                        : language === "tr"
                          ? "Başlık"
                          : "Title"}
                  </label>
                  <Input
                    type="text"
                    value={formData.translations[lang].title}
                    onChange={(e) => handleTranslationChange(lang, "title", e.target.value)}
                    className="bg-muted/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    {language === "az"
                      ? "Təsvir"
                      : language === "ru"
                        ? "Описание"
                        : language === "tr"
                          ? "Açıklama"
                          : "Description"}
                  </label>
                  <Textarea
                    value={formData.translations[lang].description}
                    onChange={(e) => handleTranslationChange(lang, "description", e.target.value)}
                    rows={5}
                    className="bg-muted/50"
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Status & Publish */}
          <Card className="p-6 bg-background border-2 border-ink">
            <h2 className="text-xl font-bold text-ink mb-4">
              {language === "az"
                ? "Status"
                : language === "ru"
                  ? "Статус"
                  : language === "tr"
                    ? "Durum"
                    : "Status"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  {language === "az"
                    ? "Seminar Status"
                    : language === "ru"
                      ? "Статус семинара"
                      : language === "tr"
                        ? "Seminer Durumu"
                        : "Seminar Status"}
                </label>
                <Select value={formData.status} onValueChange={(value: any) => handleInputChange("status", value)}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">
                      {language === "az"
                        ? "Yaxındakı"
                        : language === "ru"
                          ? "Предстоящий"
                          : language === "tr"
                            ? "Yaklaşan"
                            : "Upcoming"}
                    </SelectItem>
                    <SelectItem value="completed">
                      {language === "az"
                        ? "Keçmiş"
                        : language === "ru"
                          ? "Завершённый"
                          : language === "tr"
                            ? "Tamamlanan"
                            : "Completed"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => handleInputChange("published", e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-semibold text-ink">
                    {language === "az"
                      ? "Yayınla"
                      : language === "ru"
                        ? "Опубликовать"
                        : language === "tr"
                          ? "Yayınla"
                          : "Publish"}
                  </span>
                </label>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-ink hover:bg-ink/90 text-paper flex-1"
            >
              {submitting
                ? language === "az"
                  ? "Saxlanılır..."
                  : language === "ru"
                    ? "Сохранение..."
                    : language === "tr"
                      ? "Kaydediliyor..."
                      : "Saving..."
                : language === "az"
                  ? "Saxla"
                  : language === "ru"
                    ? "Сохранить"
                    : language === "tr"
                      ? "Kaydet"
                      : "Save"}
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/admin/seminars")}
              variant="outline"
            >
              {language === "az"
                ? "Ləğv Et"
                : language === "ru"
                  ? "Отмена"
                  : language === "tr"
                    ? "İptal"
                    : "Cancel"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSeminarForm;
