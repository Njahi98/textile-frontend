import { motion } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock, 
  Shield, 
  CheckCircle,
  Factory,
  Award,
  LogIn,
  Rocket
} from "lucide-react";
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
  const features = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Monitor production metrics, worker performance, and line efficiency with live dashboards and instant insights.",
      color: ""
    },
    {
      icon: Users,
      title: "Worker Management",
      description: "Track individual performance, manage assignments, and optimize workforce allocation across production lines.",
      color: ""
    },
    {
      icon: TrendingUp,
      title: "Performance Optimization",
      description: "AI-powered recommendations to boost productivity, reduce errors, and maximize output quality.",
      color: ""
    },
    {
      icon: Clock,
      title: "Shift Planning",
      description: "Smart scheduling system that balances workload, tracks attendance, and ensures optimal coverage.",
      color: ""
    }
  ];

  const stats = [
    { value: "45%", label: "Increase in Productivity" },
    { value: "60%", label: "Reduction in Errors" },
    { value: "24/7", label: "Real-time Monitoring" },
    { value: "2hrs", label: "Saved Daily per Line" }
  ];

  const testimonials = [
    {
      quote: "This platform transformed how we manage our production lines. The insights are invaluable.",
      author: "Sarah Chen",
      role: "Production Manager",
      company: "TechTextile Industries"
    },
    {
      quote: "Worker performance tracking has never been this easy. We've seen dramatic improvements.",
      author: "Mohamed Ali",
      role: "Operations Director",
      company: "Global Fabrics Co."
    },
    {
      quote: "The Excel import feature saved us months of data migration. Seamless integration!",
      author: "Lisa Martinez",
      role: "Plant Supervisor",
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
            Optimize Your Textile
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary/70 to-foreground/70">
              Production Lines
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto"
          >
            Transform your textile facility with real-time analytics, intelligent worker management, 
            and data-driven insights. Import Excel data, track performance, and boost productivity by up to 45%.
          </motion.p>
          
            <motion.div 
            variants={fadeInUp}
            className="flex flex-col gap-4 items-center w-full sm:flex-row sm:justify-center"
            >
            <Link to="/auth/login" className="w-full sm:w-auto">
              <button type="button" className="w-full sm:w-auto px-8 py-4 bg-foreground text-background hover:bg-foreground/90
               text-lg rounded-md transition-all transform hover:scale-105 flex items-center
              justify-center font-semibold shadow-lg cursor-pointer">
              Sign In
              <LogIn className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <Link to="/auth/register" className="w-full sm:w-auto">
              <button type="button" className="w-full sm:w-auto px-8 py-4 border border-border text-foreground/80
               hover:bg-secondary text-lg rounded-md transition-colors flex items-center
              justify-center backdrop-blur-sm cursor-pointer">
              Get Started
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
              Why Choose TextilePro?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built specifically for textile manufacturers, our platform understands your unique challenges
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
              Simple Setup, Powerful Results
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Import Your Data", desc: "Upload Excel files or manually input your production data" },
              { step: "2", title: "Track Performance", desc: "Monitor workers, products, and production lines in real-time" },
              { step: "3", title: "Optimize & Scale", desc: "Use AI insights to improve efficiency and reduce costs" }
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
              Trusted by Industry Leaders
            </h2>
            <p className="text-muted-foreground text-lg">
              Join hundreds of textile facilities improving their operations
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
                    <Award key={`star-${testimonial.author}-${id}`} className="h-4 w-4 text-amber-500 fill-current" />
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
              Ready to Try TextilePro?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience how TextilePro can transform your textile production. 
              Sign up now for our demo version and explore all features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 w-full max-w-md mx-auto">         
              <Link to="/auth/login" className="w-full">
              <button type="button" className="w-full px-8 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-md font-semibold transition-colors flex items-center justify-center shadow-lg">
                Sign In
                <CheckCircle className="ml-2 h-5 w-5" />
              </button>
              </Link>
              <Link to="/auth/register" className="w-full">
              <button type="button" className="w-full px-8 py-3 border border-border text-foreground hover:bg-secondary rounded-md font-semibold transition-colors backdrop-blur-sm flex items-center justify-center">
                Get Started
              </button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
              Demo Version
              </span>
              <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
              No Credit Card
              </span>
              <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
              Try All Features
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
            © 2025 TextilePro. All rights reserved. | Privacy | Terms
          </div>
        </div>
      </footer>
</>
  );
}