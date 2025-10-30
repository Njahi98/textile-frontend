import { motion } from "framer-motion";
import { BarChart3, Users, TrendingUp, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fadeInUp, staggerContainer } from "../data/animations";

export default function FeaturesGrid() {
  const { t } = useTranslation(['home']);
  const features = [
    { icon: BarChart3, title: t('features.analytics.title'), description: t('features.analytics.description'), color: "" },
    { icon: Users, title: t('features.workers.title'), description: t('features.workers.description'), color: "" },
    { icon: TrendingUp, title: t('features.optimization.title'), description: t('features.optimization.description'), color: "" },
    { icon: Clock, title: t('features.scheduling.title'), description: t('features.scheduling.description'), color: "" },
  ];
  return (
    <section className="relative z-10 px-6 lg:px-12 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">{t('sections.features.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('sections.features.subtitle')}</p>
        </div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="bg-card/50 border border-border/50 rounded-md p-6 backdrop-blur-sm hover:bg-card transition-all duration-300"
            >
              <feature.icon className={`h-10 w-10 text-primary mb-4`} />
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}


