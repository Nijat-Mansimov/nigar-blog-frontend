import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "@/services/adminService";
import { compressAndEncodeImage, formatFileSize } from "@/lib/imageCompress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import MarkdownEditor from "@/components/MarkdownEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Translation {
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
}

interface FormData {
  slug: string;
  translations: {
    en: Translation;
    az: Translation;
    ru: Translation;
    tr: Translation;
  };
  date: string;
  category: string;
  featured: boolean;
  readingTime: number;
  image?: string;
  defaultLanguage: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

type Language = "en" | "az" | "ru" | "tr";

const LANGUAGES: Language[] = ["en", "az", "ru", "tr"];
const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  az: "Azərbaycanca",
  ru: "Русский",
  tr: "Türkçe",
};

const emptyTranslation: Translation = {
  title: "",
  subtitle: "",
  excerpt: "",
  body: "",
};

const AdminArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<Language>("az");
  const [formData, setFormData] = useState<FormData>({
    slug: "",
    translations: {
      en: { ...emptyTranslation },
      az: { ...emptyTranslation },
      ru: { ...emptyTranslation },
      tr: { ...emptyTranslation },
    },
    date: new Date().toLocaleDateString(),
    category: "",
    featured: false,
    readingTime: 5,
    image: "",
    defaultLanguage: "az",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthed = await adminService.verifyToken();
      if (!isAuthed) {
        navigate("/admin/login");
      }

      // Fetch categories
      const categoriesResult = await adminService.getCategories();
      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data);

        // Set default category to first one if available
        if (categoriesResult.data.length > 0 && !id) {
          setFormData((prev) => ({
            ...prev,
            category: categoriesResult.data[0].name,
          }));
        }
      }
    };

    checkAuth();

    if (id) {
      const fetchArticle = async () => {
        const result = await adminService.getArticle(id);
        if (result.success && result.data) {
          setFormData({
            slug: result.data.slug,
            translations: result.data.translations || {
              en: { ...emptyTranslation },
              az: { ...emptyTranslation },
              ru: { ...emptyTranslation },
              tr: { ...emptyTranslation },
            },
            date: result.data.date,
            category: result.data.category,
            featured: result.data.featured || false,
            readingTime: result.data.readingTime,
            image: result.data.image || "",
            defaultLanguage: result.data.defaultLanguage || "az",
          });
        }
        setLoading(false);
      };
      fetchArticle();
    }
  }, [id, navigate]);

  const handleImageFile = async (file?: File | null) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const compressedBase64 = await compressAndEncodeImage(file);
      const result = await adminService.uploadImage(compressedBase64);
      if (result.success && result.data?.url) {
        setFormData((prev) => ({ ...prev, image: result.data!.url }));
        toast({ title: "Cover uploaded", description: "Cover image uploaded successfully" });
      } else {
        toast({ title: "Upload failed", description: result.error || "Failed to upload image", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Upload failed", description: "Failed to process image", variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTranslationChange = (field: keyof Translation, value: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [currentLanguage]: {
          ...prev.translations[currentLanguage],
          [field]: value,
        },
      },
    }));
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "readingTime" ? parseInt(value) : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      featured: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate at least one language is fully filled, and any partial languages are completed
    let hasValidLanguage = false;
    for (const lang of LANGUAGES) {
      const hasTitle = formData.translations[lang].title.trim();
      const hasBody = formData.translations[lang].body.trim();
      
      // If language has started but is incomplete, error
      if ((hasTitle && !hasBody) || (!hasTitle && hasBody)) {
        toast({
          title: "Validation error",
          description: `${LANGUAGE_LABELS[lang]}: Both title and body content are required if you start translating in this language`,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      
      // Track if we have at least one complete language
      if (hasTitle && hasBody) {
        hasValidLanguage = true;
      }
    }

    if (!hasValidLanguage) {
      toast({
        title: "Validation error",
        description: "Please provide at least one complete translation (title and body)",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        title: "Validation error",
        description: "Slug is required",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    let result;

    if (id) {
      result = await adminService.updateArticle(id, formData);
    } else {
      result = await adminService.createArticle(formData);
    }

    if (result.success) {
      toast({
        title: id ? "Article updated" : "Article created",
        description: id
          ? "Your article has been updated successfully"
          : "Your new article has been published",
      });
      navigate("/admin/dashboard");
    } else {
      toast({
        title: "Error",
        description: result.error || (id ? "Failed to update article" : "Failed to create article"),
        variant: "destructive",
      });
    }

    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setSubmitting(true);
    const result = await adminService.deleteArticle(id);

    if (result.success) {
      toast({
        title: "Article deleted",
        description: "Your article has been successfully deleted",
      });
      navigate("/admin/dashboard");
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete article",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const currentTranslation = formData.translations[currentLanguage];

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Header */}
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-ink mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-black text-ink mb-8">
          {id ? "Edit Article" : "Create New Article"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 border border-rule p-8 rounded-lg bg-card">
          {/* Language Tabs */}
          <div className="space-y-4">
            <Label>Translations</Label>
            <p className="text-sm text-muted-foreground">
              Fill in only the languages you need. At least one language (title + body) is required. Skip any language tabs you don't want to use.
            </p>
            <div className="flex gap-2 border-b border-rule pb-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setCurrentLanguage(lang)}
                  className={`px-4 py-2 font-semibold uppercase transition-colors ${
                    currentLanguage === lang
                      ? "text-ink border-b-2 border-ink pb-1"
                      : "text-muted-foreground hover:text-ink"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Translation Content */}
            <div className="space-y-4 mt-6 pt-4 border-t border-rule">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title ({LANGUAGE_LABELS[currentLanguage]})
                </Label>
                <Input
                  id="title"
                  value={currentTranslation.title}
                  onChange={(e) => handleTranslationChange("title", e.target.value)}
                  placeholder={`Article title in ${LANGUAGE_LABELS[currentLanguage]}`}
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">
                  Subtitle ({LANGUAGE_LABELS[currentLanguage]})
                </Label>
                <Input
                  id="subtitle"
                  value={currentTranslation.subtitle}
                  onChange={(e) => handleTranslationChange("subtitle", e.target.value)}
                  placeholder={`Article subtitle in ${LANGUAGE_LABELS[currentLanguage]}`}
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">
                  Excerpt ({LANGUAGE_LABELS[currentLanguage]})
                </Label>
                <Textarea
                  id="excerpt"
                  value={currentTranslation.excerpt}
                  onChange={(e) => handleTranslationChange("excerpt", e.target.value)}
                  placeholder={`Short preview in ${LANGUAGE_LABELS[currentLanguage]}`}
                  rows={3}
                />
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label htmlFor="body">
                  Body Content ({LANGUAGE_LABELS[currentLanguage]})
                </Label>
                <MarkdownEditor
                  value={currentTranslation.body}
                  onChange={(newValue) => handleTranslationChange("body", newValue)}
                  onImageUpload={async (base64) => {
                    try {
                      const result = await adminService.uploadImage(base64);
                      if (result.success && result.data?.url) {
                        toast({
                          title: "Image uploaded",
                          description: "Image has been uploaded successfully",
                        });
                        return result.data.url;
                      }
                    } catch (error) {
                      toast({
                        title: "Upload failed",
                        description: "Failed to upload image",
                        variant: "destructive",
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-rule pt-6" />

          {/* Settings Tab */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Settings</Label>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug * (URL-friendly identifier)</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleSettingChange}
                placeholder="article-slug"
                required
              />
              <p className="text-xs text-muted-foreground">
                URL: /article/{formData.slug}
              </p>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="cover">Cover Image</Label>
              {formData.image ? (
                <div className="flex items-start gap-4">
                  <img src={formData.image} alt="cover preview" className="w-48 h-32 object-cover rounded border border-rule" />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">Change cover:</p>
                    <input
                      id="cover"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
                      disabled={uploadingImage}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData((p) => ({ ...p, image: "" }))}
                      disabled={uploadingImage}
                    >
                      Remove cover
                    </Button>
                    {uploadingImage && <span className="text-xs text-muted-foreground">Uploading...</span>}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <p className="text-sm text-muted-foreground">Uploading...</p>}
                  <p className="text-xs text-muted-foreground">Recommended: 1200x630px for best display</p>
                </div>
              )}
            </div>

            {/* Meta fields grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Publication Date</Label>
                <Input
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleSettingChange}
                  placeholder="February 20, 2026"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleSettingChange}
                  className="w-full px-3 py-2 border border-rule rounded-md bg-background"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reading Time */}
              <div className="space-y-2">
                <Label htmlFor="readingTime">Reading Time (minutes)</Label>
                <Input
                  id="readingTime"
                  name="readingTime"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.readingTime}
                  onChange={handleSettingChange}
                />
              </div>

              {/* Featured */}
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured article
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-8 border-t border-rule justify-between">
            <div className="flex gap-4">
              <Link to="/admin/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : id ? "Update Article" : "Create Article"}
              </Button>
            </div>
            {id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive" disabled={submitting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Article
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Delete Article</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this article? This action cannot be undone.
                  </AlertDialogDescription>
                  <div className="flex gap-4 justify-end mt-4">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminArticleForm;
