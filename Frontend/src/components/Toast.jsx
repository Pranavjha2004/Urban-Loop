import { motion, AnimatePresence } from "framer-motion";

function Toast({ toast, setToast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-xl text-white text-sm font-medium
          ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;