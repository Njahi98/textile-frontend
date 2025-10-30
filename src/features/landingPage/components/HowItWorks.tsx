import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function HowItWorks() {
  const { t } = useTranslation(['home']);
  const steps = [
    { step: "1", title: t('steps.import.title'), desc: t('steps.import.description') },
    { step: "2", title: t('steps.track.title'), desc: t('steps.track.description') },
    { step: "3", title: t('steps.optimize.title'), desc: t('steps.optimize.description') },
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
          <h2 className="text-4xl font-bold text-foreground mb-4">{t('sections.howItWorks.title')}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{}}
              viewport={{ once: true }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-secondary rounded-md flex items-center justify-center text-foreground font-bold border border-border">
                {item.step}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}


