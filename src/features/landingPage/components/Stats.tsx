import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Stats() {
  const { t } = useTranslation(['home']);
  const items = [
    { id: 'productivity', value: "45%", label: t('stats.productivity') },
    { id: 'errorReduction', value: "60%", label: t('stats.errorReduction') },
    { id: 'monitoring', value: "24/7", label: t('stats.monitoring') },
    { id: 'timeSaved', value: "2hrs", label: t('stats.timeSaved') }
  ];
  return (
    <section className="relative z-10 px-6 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
      >
        {items.map((item) => (
          <div key={item.id} className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">{item.value}</div>
            <div className="text-sm text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}


