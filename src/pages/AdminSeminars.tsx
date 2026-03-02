import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Seminar, seminarService } from "@/services/seminarService";
import { adminService } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Edit, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AdminSeminars = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadSeminars = async () => {
      try {
        const isAuthed = await adminService.verifyToken();
        if (!isAuthed) {
          navigate("/admin/login");
          return;
        }

        setLoading(true);
        const token = adminService.getAccessToken();
        if (!token) {
          navigate("/admin/login");
          return;
        }

        const data = await seminarService.getAdminList(token);
        setSeminars(data);
        setError(null);
      } catch (err) {
        setError("Failed to load seminars");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSeminars();
  }, [navigate]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      const token = adminService.getAccessToken();
      if (!token) {
        navigate("/admin/login");
        return;
      }
      await seminarService.delete(deleteConfirm.id, token);
      setSeminars(seminars.filter((s) => s.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      setError(null);
      toast({
        title: "Success",
        description: t('admin.seminarDeleted'),
      });
    } catch (err) {
      setError("Failed to delete seminar");
      toast({
        title: "Error",
        description: "Failed to delete seminar",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-muted text-ink";
      case "completed":
        return "bg-muted/60 text-muted-foreground";
      default:
        return "bg-muted text-ink";
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 pb-20">
        {/* Header */}
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-ink mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t('admin.backToDashboard')}
        </Link>

        <h1 className="text-4xl md:text-5xl font-black text-ink mb-2">
          {t('admin.manageSeminars')}
        </h1>
        <p className="text-muted-foreground mb-8">
          {seminars.length} {t('admin.seminars')}
        </p>
        
        <div className="flex justify-end mb-8">
          <Button
            onClick={() => navigate("/admin/seminars/new")}
            className="bg-ink hover:bg-ink/90 text-paper"
          >
            <Plus size={20} className="mr-2" />
            {t('admin.newSeminar')}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink"></div>
          </div>
        ) : seminars.length === 0 ? (
          <div className="text-center py-12 border-2 border-ink p-8 bg-background">
            <p className="text-ink text-lg mb-4">
              {t('admin.noSeminars')}
            </p>
            <Button
              onClick={() => navigate("/admin/seminars/new")}
              className="bg-ink hover:bg-ink/90 text-paper"
            >
              {t('admin.createSeminar')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-ink rounded-lg">
            <table className="w-full text-sm bg-background">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th className="text-left py-4 px-4 font-semibold text-ink">
                    {t('admin.title')}
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-ink">
                    {t('admin.date')}
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-ink">
                    {t('admin.format')}
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-ink">
                    {t('admin.status')}
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-ink">
                    {t('admin.publish')}
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-ink">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {seminars.map((seminar) => {
                  const translation =
                    seminar.translations[language as keyof typeof seminar.translations] ||
                    seminar.translations.en;
                  const startDate = new Date(seminar.startDateTime);

                  return (
                    <tr
                      key={seminar.id}
                      className="border-b border-ink hover:bg-muted/20"
                    >
                      <td className="py-4 px-4">
                        <p className="font-semibold text-ink line-clamp-1">
                          {translation.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{seminar.slug}</p>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {startDate.toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-muted text-ink font-sans-clean text-xs tracking-widest">
                          {seminar.format.charAt(0).toUpperCase() + seminar.format.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(seminar.status)}>
                          {seminar.status === "upcoming" ? t('seminarsPage.upcoming') : t('seminarsPage.completed')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            seminar.published
                              ? "bg-muted text-ink"
                              : "bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {seminar.published ? t('admin.published') : t('admin.unpublished')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/seminars/${seminar.id}/edit`)}
                            className="p-2 text-ink hover:bg-muted rounded"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                id: seminar.id || "",
                                title: translation.title,
                              })
                            }
                            className="p-2 text-red-600 hover:bg-red-100/20 rounded dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('admin.deleteSeminar')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.deleteSeminarConfirm')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setDeleteConfirm(null)}
                variant="outline"
                disabled={deleting}
              >
                {t('admin.cancel')}
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Deleting..." : t('admin.delete')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminSeminars;
