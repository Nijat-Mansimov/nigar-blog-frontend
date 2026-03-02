import { Seminar } from "@/services/seminarService";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { seminarService } from "@/services/seminarService";

interface SeminarCardProps {
  seminar: Seminar;
}

export const SeminarCard = ({ seminar }: SeminarCardProps) => {
  const { language } = useLanguage();
  const [views, setViews] = useState(seminar.views || 0);

  useEffect(() => {
    const getViews = async () => {
      try {
        const viewCount = await seminarService.getViews(seminar.slug);
        setViews(viewCount);
      } catch (error) {
        console.error("Error fetching views:", error);
      }
    };
    getViews();
  }, [seminar.slug]);

  const translation = seminar.translations[language as keyof typeof seminar.translations] || seminar.translations.en;
  const startDate = new Date(seminar.startDateTime);
  const endDate = new Date(seminar.endDateTime);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === "en" ? "en-US" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  return (
    <Link to={`/seminars/${seminar.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col bg-card border border-rule">
        {/* Cover Image */}
        {seminar.coverImage && (
          <div className="w-full h-48 overflow-hidden bg-muted">
            <img
              src={seminar.coverImage}
              alt={translation.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-4 flex flex-col flex-grow">
          {/* Topic Badge */}
          <div className="mb-2">
            <Badge className="bg-muted text-ink font-sans-clean text-xs tracking-widest">
              {seminar.topic}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold mb-2 line-clamp-2 text-ink">
            {translation.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {translation.description}
          </p>

          {/* Status and Format Badges */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <Badge className={getStatusColor(seminar.status)}>
              {seminar.status === "upcoming" ? "Upcoming" : "Completed"}
            </Badge>
            <Badge className={getFormatColor(seminar.format)}>
              {seminar.format.charAt(0).toUpperCase() + seminar.format.slice(1)}
            </Badge>
          </div>

          {/* Date and Time */}
          <div className="text-xs text-muted-foreground mb-3">
            <p className="font-semibold text-ink">{formatDate(startDate)}</p>
            {formatDate(startDate) !== formatDate(endDate) && (
              <p className="text-muted-foreground">{formatDate(endDate)}</p>
            )}
          </div>

          {/* Location (if offline) */}
          {(seminar.format === "offline" || seminar.format === "hybrid") && seminar.location && (
            <p className="text-xs text-muted-foreground mb-3">
              📍 {seminar.location}
            </p>
          )}

          {/* View Count */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-3 border-t border-rule">
            <Eye size={14} />
            <span>{views} views</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
