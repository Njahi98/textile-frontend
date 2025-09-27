import { motion } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock, 
  Shield, 
  CheckCircle,
  Factory,
  Star,
  LogIn,
  Rocket
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const {t} = useTranslation(['home']);

  const features = [
  {
    icon: BarChart3,
    title: t('features.analytics.title'),
    description: t('features.analytics.description'),
    color: ""
  },
  {
    icon: Users,
    title: t('features.workers.title'),
    description: t('features.workers.description'),
    color: ""
  },
  {
    icon: TrendingUp,
    title: t('features.optimization.title'),
    description: t('features.optimization.description'),
    color: ""
  },
  {
    icon: Clock,
    title: t('features.scheduling.title'),
    description: t('features.scheduling.description'),
    color: ""
  }
];

  const stats = [
  { value: "45%", label: t('stats.productivity') },
  { value: "60%", label: t('stats.errorReduction') },
  { value: "24/7", label: t('stats.monitoring') },
  { value: "2hrs", label: t('stats.timeSaved') }
];

  const testimonials = [
  {
    quote: t('testimonials.sarah.quote'),
    author: "Sarah Chen",
    role: t('testimonials.sarah.role'),
    company: "TechTextile Industries"
  },
  {
    quote: t('testimonials.mohamed.quote'),
    author: "Mohamed Ali", 
    role: t('testimonials.mohamed.role'),
    company: "Global Fabrics Co."
  },
  {
    quote: t('testimonials.lisa.quote'),
    author: "Lisa Martinez",
    role: t('testimonials.lisa.role'),
    company: "Premium Textiles Ltd."
  }
];

  return (
    <>
      {/* Hero Section */}
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
            <Link to="/auth/login" className="w-full sm:w-auto">
              <button type="button" className="w-full sm:w-auto px-8 py-4 bg-foreground text-background hover:bg-foreground/90
               text-lg rounded-md transition-all transform hover:scale-105 flex items-center
              justify-center font-semibold shadow-lg cursor-pointer">
              {t('buttons.signIn')}
              <LogIn className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <Link to="/auth/register" className="w-full sm:w-auto">
              <button type="button" className="w-full sm:w-auto px-8 py-4 border border-border text-foreground/80
               hover:bg-secondary text-lg rounded-md transition-colors flex items-center
              justify-center backdrop-blur-sm cursor-pointer">
              {t('buttons.getStarted')}
              <Rocket className="ml-2 h-5 w-5" />
              </button>
            </Link>
            </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

       {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-5xl mx-auto mt-16"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl transform rotate-1 scale-105"></div>
            <motion.img
              whileHover={{ scale: 1.02, rotateY: 2 }}
              transition={{ duration: 0.3 }}
              src="/dashboard.webp"
              alt="TextilePro Dashboard Preview"
              className="relative z-10 w-full rounded-xl shadow-2xl border border-border/30 transform -rotate-1 hover:rotate-0 transition-all duration-500"
              style={{
                filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))'
              }}
            />
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 blur-xl opacity-60 transform rotate-2"></div>
          </div>
        </motion.div>

      {/* Features Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('sections.features.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('sections.features.subtitle')}
            </p>
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
                className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm hover:bg-card transition-all duration-300"
              >
                <feature.icon className={`h-10 w-10 text-primary mb-4`} />
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-12">
           <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('sections.howItWorks.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: t('steps.import.title'), desc: t('steps.import.description') },
              { step: "2", title: t('steps.track.title'), desc: t('steps.track.description') },
              { step: "3", title: t('steps.optimize.title'), desc: t('steps.optimize.description') }
            ].map((item) => (
              <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{}}
              viewport={{ once: true }}
              className="flex items-start space-x-4"
              >
              <div className="flex-shrink-0 w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-foreground font-bold border border-border">
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

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('sections.testimonials.title')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('sections.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{}}
                viewport={{ once: true }}
                className="bg-card/25 border border-border/30 rounded-lg p-6 backdrop-blur-sm hover:bg-card/40 transition-all duration-300"
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

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
            <div className="bg-card/50 border border-border/40 rounded-xl p-12 backdrop-blur-sm text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('sections.cta.title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('sections.cta.description')}
            </p>
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
              <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
              {t('features.demo')}
              </span>
              <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
              {t('features.noCard')}
              </span>
              <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
              {t('features.tryAll')}
              </span>
            </div>
            </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Factory className="h-6 w-6 text-muted-foreground" />
            <span className="text-xl font-bold text-foreground">TextilePro</span>
          </div>
          <div className="text-muted-foreground text-sm">
            {t('footer.copyright')}
          </div>
        </div>
      </footer>
</>
  );
}