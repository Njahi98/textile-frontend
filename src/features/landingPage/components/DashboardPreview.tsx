import { motion } from "framer-motion";

export default function DashboardPreview() {
  return (
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
          className="relative z-10 w-full rounded-md shadow-2xl border border-border/30 transform -rotate-1 hover:rotate-0 transition-all duration-500"
          style={{ filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))' }}
        />
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 blur-xl opacity-60 transform rotate-2"></div>
      </div>
    </motion.div>
  );
}


