import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CalendarHeader() {
  const { t } = useTranslation(["assignment"]);
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
            <h2 className="text-xl md:text-2xl font-bold truncate">
              {t('calendar.header.title')}
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {t('calendar.header.subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
}


