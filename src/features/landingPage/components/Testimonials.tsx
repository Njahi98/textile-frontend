import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Testimonials() {
  const { t } = useTranslation(['home']);
  const testimonials = [
    { quote: t('testimonials.sarah.quote'), author: "Sarah Chen", role: t('testimonials.sarah.role'), company: "TechTextile Industries" },
    { quote: t('testimonials.mohamed.quote'), author: "Mohamed Ali", role: t('testimonials.mohamed.role'), company: "Global Fabrics Co." },
    { quote: t('testimonials.lisa.quote'), author: "Lisa Martinez", role: t('testimonials.lisa.role'), company: "Premium Textiles Ltd." },
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
          <h2 className="text-4xl font-bold text-foreground mb-4">{t('sections.testimonials.title')}</h2>
          <p className="text-muted-foreground text-lg">{t('sections.testimonials.subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{}}
              viewport={{ once: true }}
              className="bg-card/25 border border-border/30 rounded-md p-6 backdrop-blur-sm hover:bg-card/40 transition-all duration-300"
            >
              <div className="flex mb-4">
                {['one','two','three','four','five'].map((id) => (
                  <Star key={`star-${testimonial.author}-${id}`} className="h-4 w-4 text-amber-500 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
              <div className="mt-auto">
                <div className="font-semibold text-foreground">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                <div className="text-sm text-muted-foreground">{testimonial.company}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}


