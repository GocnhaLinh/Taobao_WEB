import React, { createContext, useContext, useState, useCallback } from "react";
import { useTranslation } from "./i18n";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationItem {
  id: string;
  messageKey: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (messageKey: any, type?: NotificationType, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();

  const showNotification = useCallback(
    (messageKey: any, type: NotificationType = "success", duration: number = 3500) => {
      const id = Math.random().toString(36).substring(2, 9);
      setNotifications((prev) => [...prev, { id, messageKey, type }]);

      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((item) => item.id !== id));
        }, duration);
      }
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const renderMessage = (msg: any) => {
    if (!msg) return "Thông báo";
    let text = "";
    if (typeof msg === "string") {
      text = t(msg as any) || msg;
    } else if (typeof msg === "object") {
      text =
        msg.response?.data?.error ||
        msg.response?.data?.message ||
        msg.message ||
        String(msg);
    } else {
      text = String(msg);
    }

    if (
      text.includes("prisma") ||
      text.includes("invocation") ||
      text.includes("CategoryToProduct") ||
      text.includes("\\backend\\") ||
      text.includes("required relation")
    ) {
      return "Không thể xóa vĩnh viễn danh mục này vì đang có sản phẩm thuộc danh mục.";
    }

    return text;
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 z-50 flex flex-col sm:max-w-sm w-auto sm:w-full pointer-events-none transition-all duration-300"
        style={{
          minHeight:
            notifications.length > 0
              ? isHovered
                ? `${notifications.length * 88}px`
                : "100px"
              : "0px",
        }}
      >
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full pointer-events-auto"
        >
          {notifications.map((notif, index) => {
            const isSuccess = notif.type === "success";
            const isError = notif.type === "error";
            const isWarning = notif.type === "warning";

            // Calculate reverse index (0 = newest, 1 = second newest, etc.)
            const reverseIndex = notifications.length - 1 - index;
            const height = 76; // Expected height of each toast item
            const gap = 12; // Gap between items

            let transform = "";
            let scale = 1;
            let opacity = 1;
            let zIndex = 50 - reverseIndex;

            if (isHovered) {
              // Expanded state: standard list stacking down
              transform = `translateY(${reverseIndex * (height + gap)}px)`;
              scale = 1;
              opacity = 1;
            } else {
              // Collapsed state: stacked with slight offset (peek)
              if (reverseIndex === 0) {
                transform = "translateY(0px)";
                scale = 1;
                opacity = 1;
              } else if (reverseIndex === 1) {
                transform = "translateY(8px)";
                scale = 0.96;
                opacity = 0.9;
              } else if (reverseIndex === 2) {
                transform = "translateY(16px)";
                scale = 0.92;
                opacity = 0.7;
              } else {
                // Older items hidden behind the stack
                transform = "translateY(24px)";
                scale = 0.88;
                opacity = 0;
              }
            }

            return (
              <div
                key={notif.id}
                className={`pointer-events-auto absolute right-0 w-full flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl toast-item-transition ${
                  isSuccess
                    ? "bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-xl shadow-emerald-900/10 dark:bg-emerald-950/90 dark:border-emerald-500/35 dark:text-emerald-200 dark:shadow-emerald-950/20"
                    : isError
                      ? "bg-rose-50/95 border-rose-300 text-rose-950 shadow-xl shadow-rose-900/10 dark:bg-rose-950/90 dark:border-rose-500/35 dark:text-rose-200 dark:shadow-rose-950/20"
                      : isWarning
                        ? "bg-amber-50/95 border-amber-300 text-amber-950 shadow-xl shadow-amber-900/10 dark:bg-amber-950/90 dark:border-amber-500/35 dark:text-amber-200 dark:shadow-amber-950/20"
                        : "bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-xl shadow-emerald-900/10 dark:bg-emerald-950/90 dark:border-emerald-500/35 dark:text-emerald-200 dark:shadow-emerald-950/20"
                }`}
                style={{
                  transform,
                  scale,
                  opacity,
                  zIndex,
                  position: "absolute",
                  top: 0,
                }}
              >
                {isError ? (
                  <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                ) : isWarning ? (
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 text-xs font-semibold leading-relaxed">
                  {renderMessage(notif.messageKey)}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notif.id);
                  }}
                  className={`p-1 -mr-1 rounded-xl transition-all cursor-pointer shrink-0 mt-0.5 ${
                    isError
                      ? "text-rose-700/70 hover:text-rose-950 hover:bg-rose-200/50 dark:text-rose-400 dark:hover:text-white dark:hover:bg-white/10"
                      : isWarning
                        ? "text-amber-700/70 hover:text-amber-950 hover:bg-amber-200/50 dark:text-amber-400 dark:hover:text-white dark:hover:bg-white/10"
                        : "text-emerald-700/70 hover:text-emerald-950 hover:bg-emerald-200/50 dark:text-emerald-400 dark:hover:text-white dark:hover:bg-white/10"
                  }`}
                  title="Đóng thông báo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
