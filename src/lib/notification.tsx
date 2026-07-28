import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useTranslation } from "./i18n";
import { X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

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

interface NotificationItemViewProps {
  notif: NotificationItem;
  onClose: () => void;
}

const NotificationItemView: React.FC<NotificationItemViewProps> = React.memo(
  ({ notif, onClose }) => {
    const { t } = useTranslation();
    const isSuccess = notif.type === "success";
    const isError = notif.type === "error";
    const isWarning = notif.type === "warning";

    const renderMessage = (msg: any) => {
      if (!msg) return t('notification' as any) || 'Notification';
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

      // Filter raw unhandled database constraint errors into a clean user-friendly message
      if (text.includes("Foreign key constraint") || text.includes("P2003") || text.includes("P2014") || text.includes("Không thể xóa vĩnh viễn danh mục") || text.includes("đang có sản phẩm")) {
        return t('foreignKeyConstraintError' as any) || 'Cannot complete this operation because the data is linked to other items.';
      }

      return text;
    };

    return (
      <div
        className={`pointer-events-auto relative w-full flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out transform hover:scale-[1.02] ${
          isSuccess
            ? "bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-xl shadow-emerald-900/10 dark:bg-emerald-950/90 dark:border-emerald-500/35 dark:text-emerald-200 dark:shadow-emerald-950/20"
            : isError
              ? "bg-rose-50/95 border-rose-300 text-rose-950 shadow-xl shadow-rose-900/10 dark:bg-rose-950/90 dark:border-rose-500/35 dark:text-rose-200 dark:shadow-rose-950/20"
              : isWarning
                ? "bg-amber-50/95 border-amber-300 text-amber-950 shadow-xl shadow-amber-900/10 dark:bg-amber-950/90 dark:border-amber-500/35 dark:text-amber-200 dark:shadow-amber-950/20"
                : "bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-xl shadow-emerald-900/10 dark:bg-emerald-950/90 dark:border-emerald-500/35 dark:text-emerald-200 dark:shadow-emerald-950/20"
        }`}
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
            onClose();
          }}
          className={`p-1 -mr-1 rounded-xl transition-all cursor-pointer shrink-0 mt-0.5 ${
            isError
              ? "text-rose-700/70 hover:text-rose-950 hover:bg-rose-200/50 dark:text-rose-400 dark:hover:text-white dark:hover:bg-white/10"
              : isWarning
                ? "text-amber-700/70 hover:text-amber-950 hover:bg-amber-200/50 dark:text-amber-400 dark:hover:text-white dark:hover:bg-white/10"
                : "text-emerald-700/70 hover:text-emerald-950 hover:bg-emerald-200/50 dark:text-emerald-400 dark:hover:text-white dark:hover:bg-white/10"
          }`}
          title={t('close' as any) || 'Close notification'}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

interface NotificationContainerProps {
  notifications: NotificationItem[];
  removeNotification: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = React.memo(
  ({ notifications, removeNotification }) => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 z-50 flex flex-col gap-2.5 sm:max-w-sm w-auto sm:w-full pointer-events-none transition-all duration-300">
        {notifications.map((notif) => (
          <NotificationItemView
            key={notif.id}
            notif={notif}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>
    );
  }
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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

  const contextValue = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
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
