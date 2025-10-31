import { motion } from "framer-motion";
import { LogIn, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { fadeInUp, staggerContainer } from "../data/animations";

export default function Hero() {
  const { t } = useTranslation(['home']);
  return (
    <section className="relative z-10 px-6 lg:px-12 py-12 lg:py-20">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto text-center"
      >
        <motion.h1 
          variants={fadeInUp}
          className="text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
        >
          {t('hero.title')}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary/70 to-foreground/70">
            {t('hero.subtitle')}
          </span>
        </motion.h1>

        <motion.p 
          variants={fadeInUp}
          className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto"
        >
          {t('hero.description')}
        </motion.p>

        <motion.div 
          variants={fadeInUp}
          className="flex flex-col gap-4 items-center w-full sm:flex-row sm:justify-center"
        >
          <Link to="/auth/login" className="w-auto">
        <button type="button" className="w-auto px-8 py-4 bg-foreground text-background hover:bg-foreground/90 text-lg rounded-md transition-all transform hover:scale-105 flex items-center justify-center font-semibold shadow-lg cursor-pointer">
          {t('buttons.signIn')}
          <LogIn className="ml-2 h-5 w-5" />
        </button>
          </Link>
          <Link to="/auth/register" className="w-auto">
        <button type="button" className="w-auto px-8 py-4 border border-border text-foreground/80 hover:bg-secondary text-lg rounded-md transition-colors flex items-center justify-center backdrop-blur-sm cursor-pointer">
          {t('buttons.getStarted')}
          <Rocket className="ml-2 h-5 w-5" />
        </button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}


