import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Articles from "./pages/Articles";
import ArticlePage from "./pages/ArticlePage";
import About from "./pages/About";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminArticleForm from "./pages/AdminArticleForm";
import AdminCategories from "./pages/AdminCategories";
import AdminChangePassword from "./pages/AdminChangePassword";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminAbout from "./pages/AdminAbout";
import NotFound from "./pages/NotFound";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const AppContent = () => {
  // Auto-refresh tokens on app load and periodically
  useAuth();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/articles" element={<Articles />} />
      <Route path="/article/:slug" element={<ArticlePage />} />
      <Route path="/about" element={<About />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/articles/new" element={<AdminArticleForm />} />
      <Route path="/admin/articles/:id/edit" element={<AdminArticleForm />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/change-password" element={<AdminChangePassword />} />
      <Route path="/admin/about" element={<AdminAbout />} />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Navbar />
            <AppContent />
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
