import { motion } from "framer-motion";
import { CheckCircle, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function CTA() {
  const { t } = useTranslation(['home']);
  return (
    <section className="relative z-10 px-6 lg:px-12 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-card/50 border border-border/40 rounded-md p-12 backdrop-blur-sm text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">{t('sections.cta.title')}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{t('sections.cta.description')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 w-full max-w-md mx-auto">
            <Link to="/auth/login" className="w-full">
              <button type="button" className="w-full px-8 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-md font-semibold transition-colors flex items-center justify-center shadow-lg">
                {t('buttons.signIn')}
                <CheckCircle className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <Link to="/auth/register" className="w-full">
              <button type="button" className="w-full px-8 py-3 border border-border text-foreground hover:bg-secondary rounded-md font-semibold transition-colors backdrop-blur-sm flex items-center justify-center">
                {t('buttons.getStarted')}
              </button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />{t('features.demo')}</span>
            <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />{t('features.noCard')}</span>
            <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />{t('features.tryAll')}</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}


