import { Factory } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation(['home']);
  return (
    <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Factory className="h-6 w-6 text-muted-foreground" />
          <span className="text-xl font-bold text-foreground">TextilePro</span>
        </div>
        <div className="text-muted-foreground text-center sm:text-left text-sm">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
}


