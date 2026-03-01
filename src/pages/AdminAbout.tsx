import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n";
import { ArrowLeft, Save, Loader, Upload, X } from "lucide-react";

type Language = "en" | "az" | "ru" | "tr";

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  az: "Azərbaycanca",
  ru: "Русский",
  tr: "Türkçe",
};

interface AboutTranslation {
  title?: string;
  content?: string;
}

interface AboutData {
  en?: AboutTranslation;
  az?: AboutTranslation;
  ru?: AboutTranslation;
  tr?: AboutTranslation;
}

interface SocialMedia {
  instagram?: string;
  threads?: string;
  medium?: string;
  facebook?: string;
  linkedin?: string;
}

const AdminAbout = () => {
  const [aboutData, setAboutData] = useState<AboutData>({});
  const [aboutImage, setAboutImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia>({});
  const [selectedLang, setSelectedLang] = useState<Language>("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

      const result = await adminService.getSettings();
      if (result.success && result.data) {
        if (result.data.about) {
          setAboutData(result.data.about);
        }
        if (result.data.aboutImage) {
          setAboutImage(result.data.aboutImage);
          setImagePreview(result.data.aboutImage);
        }
        if (result.data.socialMedia) {
          setSocialMedia(result.data.socialMedia);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleTitleChange = (value: string) => {
    setAboutData(prev => ({
      ...prev,
      [selectedLang]: {
        ...(prev[selectedLang] || {}),
        title: value,
      },
    }));
  };

  const handleContentChange = (value: string) => {
    setAboutData(prev => ({
      ...prev,
      [selectedLang]: {
        ...(prev[selectedLang] || {}),
        content: value,
      },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAboutImage(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAboutImage(null);
    setImagePreview(null);
  };

  const handleSocialMediaChange = (platform: keyof SocialMedia, value: string) => {
    setSocialMedia(prev => ({
      ...prev,
      [platform]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await adminService.updateSettings({ 
        about: aboutData,
        aboutImage: aboutImage || undefined,
        socialMedia,
      });
      if (result.success) {
        toast({
          title: "Success",
          description: "About page settings saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save settings",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-24">
        <p className="text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  const currentAbout = aboutData[selectedLang] || {};

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Header */}
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-ink mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToDashboard}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-ink mb-2">
            {t.editAboutPage}
          </h1>
          <p className="text-muted-foreground">
            Customize the about page content in different languages
          </p>
        </div>

        {/* Language Tabs */}
        <div className="border border-rule rounded-lg p-1 bg-card mb-8 flex gap-1 flex-wrap">
          {(["en", "az", "ru", "tr"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all rounded ${
                selectedLang === lang
                  ? "bg-ink text-background"
                  : "text-ink hover:bg-muted/50"
              }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>

        {/* Image Upload Section */}
        <div className="border border-rule rounded-lg p-8 bg-card mb-8">
          <h2 className="text-lg font-semibold text-ink mb-4">About Page Image</h2>
          
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="About preview"
                  className="max-w-xs h-auto rounded-lg border border-rule"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-destructive text-background rounded-full p-1 hover:bg-destructive/90 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-rule rounded-lg p-8 cursor-pointer hover:bg-muted/20 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-semibold text-ink">Click to upload image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Form */}
        <div className="border border-rule rounded-lg p-8 bg-card mb-8">
          {/* Title Field */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-ink mb-2">
              {t.aboutTitle}
            </label>
            <input
              type="text"
              value={currentAbout.title || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t.aboutTitlePlaceholder}
              className="w-full px-4 py-3 border border-rule rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          {/* Content Field */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-ink mb-2">
              {t.aboutContent}
            </label>
            <textarea
              value={currentAbout.content || ""}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={t.aboutContentPlaceholder}
              rows={12}
              className="w-full px-4 py-3 border border-rule rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ink font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Markdown formatting is supported: **bold**, *italic*, # Headings, - Lists, etc.
            </p>
          </div>

          {/* Social Media Links Section */}
          <div className="mt-8 pt-8 border-t border-rule">
            <h3 className="text-lg font-semibold text-ink mb-6">{t.socialLinks}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instagram */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  {t.instagram}
                </label>
                <input
                  type="url"
                  value={socialMedia.instagram || ""}
                  onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                  placeholder={t.instagramPlaceholder}
                  className="w-full px-4 py-3 border border-rule rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              {/* Threads */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  {t.threads}
                </label>
                <input
                  type="url"
                  value={socialMedia.threads || ""}
                  onChange={(e) => handleSocialMediaChange("threads", e.target.value)}
                  placeholder={t.threadsPlaceholder}
                  className="w-full px-4 py-3 border border-rule rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              {/* Medium */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  {t.medium}
                </label>
                <input
                  type="url"
                  value={socialMedia.medium || ""}
                  onChange={(e) => handleSocialMediaChange("medium", e.target.value)}
                  placeholder={t.mediumPlaceholder}
                  className="w-full px-4 py-3 border border-rule rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  {t.facebook}
                </label>
                <input
                  type="url"
                  value={socialMedia.facebook || ""}
                  onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                  placeholder={t.facebookPlaceholder}
                  className="w-full px-4 py-3 border border-rule rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  {t.linkedin}
                </label>
                <input
                  type="url"
                  value={socialMedia.linkedin || ""}
                  onChange={(e) => handleSocialMediaChange("linkedin", e.target.value)}
                  placeholder={t.linkedinPlaceholder}
                  className="w-full px-4 py-3 border border-rule rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Link to="/admin/dashboard">
              <Button variant="outline">{t.cancel}</Button>
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="border border-rule rounded-lg p-6 bg-muted/20">
          <h3 className="font-bold text-ink mb-2">💡 Tip</h3>
          <p className="text-sm text-muted-foreground">
            Edit the about page content for each language separately. These changes will appear on the public About page when users view it in their selected language.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;
