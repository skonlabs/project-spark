import { Link } from "react-router-dom";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
        </div>
        <h1 className="mb-3 text-7xl font-black gradient-text-glow">404</h1>
        <p className="mb-6 text-lg text-muted-foreground font-medium">This page doesn't exist</p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-all shadow-lg shadow-primary/20">
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
