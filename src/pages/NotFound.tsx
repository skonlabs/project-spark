import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h1 className="mb-3 text-7xl font-heading font-extrabold tracking-tighter text-foreground">404</h1>
        <p className="mb-8 text-base text-muted-foreground">This page doesn't exist</p>
        <Link to="/" className="btn-primary px-6 py-2.5 text-sm">
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
