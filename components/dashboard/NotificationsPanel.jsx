"use client";
import { motion, AnimatePresence } from "framer-motion";
import NotificationCard from "../notifications/NotificationCard";



export const NotificationsPanel = ({
  showNotifications,
  setShowNotifications,
}) => {

  return (
    <AnimatePresence>
      {showNotifications && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          />

          {/* Notifications Panel */}
          <motion.div
            key="notifications-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 h-screen w-[350px] overflow-y-hidden bg-white shadow-lg rounded-l-lg z-50"
          >
            <NotificationCard
              handleNotificationClick={() => setShowNotifications(false)}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};