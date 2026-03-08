import { Link } from "react-router-dom";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative"
      >
        <h1 className="mb-4 text-8xl font-black gradient-text-glow tracking-tighter" style={{ fontFamily: "'Space Grotesk'" }}>404</h1>
        <p className="mb-8 text-lg text-muted-foreground font-medium">This page doesn't exist</p>
        <Link to="/" className="btn-primary px-6 py-3 text-sm font-bold">
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
