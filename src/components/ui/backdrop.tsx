import { motion } from "framer-motion";

function Backdrop({ children, onClick }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <motion.div
      className="fixed top-18 right-0 left-0 h-full backdrop-blur-sm z-50 bg-black/50 will-change-transform"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export default Backdrop;
