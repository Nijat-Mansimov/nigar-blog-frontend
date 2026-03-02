import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService, Article } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2, Edit, Plus, Settings, BarChart3, Lock, LogOut, Eye, BookOpen, Presentation } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type Language = "en" | "az" | "ru" | "tr";

const AdminDashboard = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthed = await adminService.verifyToken();
      if (!isAuthed) {
        navigate("/admin/login");
        return;
      }

      // Get username from token
      const token = adminService.getAccessToken();
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          setUsername(decoded.username || "Admin");
        } catch (e) {
          setUsername("Admin");
        }
      }

      const result = await adminService.getAllArticles();
      if (result.success && result.data) {
        setArticles(result.data);
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    const result = await adminService.deleteArticle(id);

    if (result.success) {
      setArticles(articles.filter((a) => a.id !== id));
      toast({
        title: "Article deleted",
        description: "The article has been successfully deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    adminService.logout();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Calculate stats
  const totalArticles = articles.length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const featuredArticles = articles.filter((a) => a.featured).length;

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Top Navigation */}
        <div className="mb-12 flex items-center justify-between border-b border-rule pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-ink mb-1">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Welcome back, <span className="font-semibold text-foreground">{username}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Articles */}
          <div className="border border-rule rounded-lg p-6 bg-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground font-sans-clean text-xs tracking-widest uppercase mb-2">
                  Total Articles
                </p>
                <h3 className="text-4xl font-black text-ink">{totalArticles}</h3>
              </div>
              <div className="p-3 bg-ink/10 rounded-lg">
                <BookOpen size={24} className="text-ink" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 border-t border-rule pt-4">
              Across all languages
            </p>
          </div>

          {/* Total Views */}
          <div className="border border-rule rounded-lg p-6 bg-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground font-sans-clean text-xs tracking-widest uppercase mb-2">
                  Total Views
                </p>
                <h3 className="text-4xl font-black text-ink">{totalViews.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-ink/10 rounded-lg">
                <Eye size={24} className="text-ink" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 border-t border-rule pt-4">
              Total page visits
            </p>
          </div>

          {/* Featured Articles */}
          <div className="border border-rule rounded-lg p-6 bg-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground font-sans-clean text-xs tracking-widest uppercase mb-2">
                  Featured
                </p>
                <h3 className="text-4xl font-black text-ink">{featuredArticles}</h3>
              </div>
              <div className="p-3 bg-ink/10 rounded-lg">
                <BarChart3 size={24} className="text-ink" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 border-t border-rule pt-4">
              Published articles
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12 border border-rule rounded-lg p-6 bg-card">
          <h2 className="text-lg font-bold text-ink mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Link to="/admin/articles/new">
              <Button className="w-full gap-2">
                <Plus size={16} />
                New Article
              </Button>
            </Link>
            <Link to="/admin/seminars">
              <Button className="w-full gap-2">
                <Presentation size={16} />
                Seminars
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button variant="outline" className="w-full gap-2">
                <BarChart3 size={16} />
                Analytics
              </Button>
            </Link>
            <Link to="/admin/categories">
              <Button variant="outline" className="w-full gap-2">
                <Settings size={16} />
                Categories
              </Button>
            </Link>
            <Link to="/admin/about">
              <Button variant="outline" className="w-full gap-2">
                <Settings size={16} />
                About Page
              </Button>
            </Link>
            <Link to="/admin/change-password">
              <Button variant="outline" className="w-full gap-2">
                <Lock size={16} />
                Change Password
              </Button>
            </Link>
          </div>
        </div>

        {/* Articles Section */}
        <div className="border border-rule rounded-lg overflow-hidden">
          <div className="bg-card border-b border-rule px-6 py-4">
            <h2 className="text-lg font-bold text-ink">Your Articles</h2>
            <p className="text-sm text-muted-foreground">Manage and edit your published content</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-card hover:bg-card border-b border-rule">
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No articles yet. <Link to="/admin/articles/new" className="text-ink hover:underline">Create one</Link>
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => {
                  // Get title from first available translation or use slug as fallback
                  const availableLangs = (Object.keys(article.translations || {}) as Language[])
                    .filter(lang => article.translations?.[lang]?.title?.trim());
                  
                  const displayTitle = availableLangs.length > 0 
                    ? article.translations?.[availableLangs[0]]?.title
                    : article.slug;

                  return (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium max-w-xs truncate">{displayTitle}</TableCell>
                      <TableCell>{article.category}</TableCell>
                      <TableCell>{article.date}</TableCell>
                      <TableCell>{article.views || 0}</TableCell>
                      <TableCell>
                        {article.featured ? (
                          <span className="text-xs px-2 py-1 bg-ink text-background rounded">
                            Featured
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                            Regular
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/articles/${article.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Delete Article</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{displayTitle}"? This action cannot be undone.
                              </AlertDialogDescription>
                              <div className="flex gap-4 justify-end mt-4">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(article.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
