import React from "react";
import { Sparkles, Heart, Loader2 } from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { useTheme } from "../../lib/theme";

export interface LoadingStateProps {
  /** Text label to display below spinner */
  text?: string;
  /** Optional secondary text label */
  subtext?: string;
  /** Size of the loader container & icon */
  size?: "sm" | "md" | "lg" | "full";
  /** Theme variant: 'dark' (Bold Tech Dark) or 'pink' (Cute Feminine Pink) */
  variant?: "dark" | "pink";
  /** Renders only the spinner icon without wrapper text */
  iconOnly?: boolean;
  /** Additional CSS classes for root container */
  className?: string;
}

export function resolveLoadingVariant(
  explicitVariant?: "dark" | "pink",
  currentTheme?: string
): "dark" | "pink" {
  if (explicitVariant) return explicitVariant;

  if (currentTheme === "light") return "pink";
  if (currentTheme === "dark") return "dark";

  if (typeof document !== "undefined") {
    if (
      document.documentElement.classList.contains("light") ||
      document.documentElement.classList.contains("pink")
    ) {
      return "pink";
    }
  }
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem("app_theme");
    if (saved === "light") return "pink";
  }

  return "dark";
}

/* ========================================================================
   1. BOLD FUTURISTIC DARK LOADER (Mạnh mẽ, Tech Cyberpunk - Seamless Icon)
   ======================================================================== */
export const DarkLoader: React.FC<Omit<LoadingStateProps, "variant">> = ({
  text,
  subtext,
  size = "md",
  iconOnly = false,
  className = "",
}) => {
  const { t } = useTranslation();
  const displayText = text !== undefined ? text : t("loadingData");

  const containerSizes = {
    sm: "py-4 px-3 space-y-2",
    md: "py-8 sm:py-12 px-4 space-y-4",
    lg: "py-12 sm:py-16 px-6 space-y-5",
    full: "min-h-[70vh] py-16 px-6 space-y-6",
  };

  const spinnerSizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    full: "w-24 h-24",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
    full: "w-11 h-11",
  };

  if (iconOnly) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 ${spinnerSizes[size]} ${className}`}
      >
        <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-md animate-pulse" />
        <Loader2
          className={`animate-spin text-indigo-400 ${iconSizes[size]}`}
        />
      </div>
    );
  }

  const gradientId = `dark-tech-spinner-${size}`;

  return (
    <div
      className={`relative flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300 ${containerSizes[size]} ${className}`}
    >
      {/* Background Tech Energy Grid Glow */}
      {size === "full" && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/20 blur-3xl animate-pulse" />
        </div>
      )}

      {/* Clean Smooth Rotating Gradient Ring Core */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${spinnerSizes[size]}`}
      >
        {/* Ambient Halo Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 blur-xl opacity-60 animate-pulse" />

        {/* Smooth Spinning Gradient Arc */}
        <svg
          className="w-full h-full animate-[spin_2s_linear_infinite]"
          viewBox="0 0 60 60"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#00f2fe" />
            </linearGradient>
          </defs>
          {/* Subtle track */}
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-slate-800 dark:text-white/10"
          />
          {/* Smooth gradient spinner arc */}
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="90 110"
          />
        </svg>

        {/* Center Seamless Floating Icon (Pure Icon Glow - No Frame/Box/Border) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-8 h-8 rounded-full bg-cyan-400/20 blur-md animate-pulse" />
          <Sparkles
            className={`relative z-10 text-cyan-400 animate-pulse drop-shadow-[0_0_12px_rgba(6,182,212,0.9)] ${iconSizes[size]}`}
          />
        </div>
      </div>

      {/* Bold Tech Label */}
      {(displayText || subtext) && (
        <div className="relative z-10 space-y-1.5 max-w-sm">
          {displayText && (
            <h4 className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>{displayText}</span>
            </h4>
          )}
          {subtext && (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* ========================================================================
   2. SUPER CUTE FEMININE PINK LOADER (Siêu Dễ Thương cho Con Gái 🌸💖 - Seamless Icon)
   ======================================================================== */
export const PinkLoader: React.FC<Omit<LoadingStateProps, "variant">> = ({
  text,
  subtext,
  size = "md",
  iconOnly = false,
  className = "",
}) => {
  const { t } = useTranslation();
  const displayText = text !== undefined ? text : t("loadingData");

  const containerSizes = {
    sm: "py-4 px-3 space-y-2",
    md: "py-8 sm:py-12 px-4 space-y-3.5",
    lg: "py-12 sm:py-16 px-6 space-y-4",
    full: "min-h-[70vh] py-16 px-6 space-y-6",
  };

  const spinnerSizes = {
    sm: "w-11 h-11",
    md: "w-16 h-16",
    lg: "w-22 h-22",
    full: "w-26 h-26",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
    full: "w-11 h-11",
  };

  if (iconOnly) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 ${spinnerSizes[size]} ${className}`}
      >
        <div className="absolute inset-0 rounded-full bg-pink-400/30 blur-md animate-pulse" />
        <Heart className="animate-bounce text-rose-500 fill-rose-400 w-5 h-5 drop-shadow-sm" />
      </div>
    );
  }

  const gradientId = `cute-pink-spinner-${size}`;

  return (
    <div
      className={`relative flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300 ${containerSizes[size]} ${className}`}
    >
      {/* Soft Pink Cloud Ambient Aura */}
      {size === "full" && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-300/30 via-rose-200/20 to-fuchsia-300/30 blur-3xl animate-pulse" />
        </div>
      )}

      {/* Clean Smooth Floating Ring Core */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${spinnerSizes[size]}`}
      >
        {/* Soft Pink Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-rose-300 to-fuchsia-400 blur-xl opacity-70 animate-pulse" />

        {/* Outer Smooth Strawberry Fluid Gradient Ring */}
        <svg
          className="w-full h-full animate-[spin_2.8s_linear_infinite]"
          viewBox="0 0 60 60"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4e50" />
              <stop offset="50%" stopColor="#ff758c" />
              <stop offset="100%" stopColor="#f72585" />
            </linearGradient>
          </defs>
          {/* Subtle track */}
          <circle
            cx="30"
            cy="30"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-pink-200/60 dark:text-pink-900/30"
          />
          {/* Main animated arc */}
          <circle
            cx="30"
            cy="30"
            r="24"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="95 110"
          />
        </svg>

        {/* Orbiting Cute Stars ✨ */}
        <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
          <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3.5 h-3.5 text-pink-400 drop-shadow animate-pulse" />
          <span className="absolute bottom-0 right-1/4 w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-300 animate-ping" />
        </div>

        {/* Center Seamless Floating Heart (Pure Heart Glow - No Frame/Box/Border) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-8 h-8 rounded-full bg-pink-500/25 blur-md animate-pulse" />
          <Heart
            className={`relative z-10 text-rose-500 fill-rose-400 animate-bounce drop-shadow-[0_0_10px_rgba(244,63,94,0.6)] ${iconSizes[size]}`}
          />
        </div>
      </div>

      {/* Adorable Pink Label */}
      {(displayText || subtext) && (
        <div className="relative z-10 space-y-1 max-w-sm">
          {displayText && (
            <h4 className="font-extrabold text-sm sm:text-base tracking-wide text-rose-900 dark:text-pink-100 flex items-center justify-center gap-1.5">
              <span className="text-pink-500 animate-bounce">✨</span>
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 dark:from-pink-300 dark:to-rose-300 bg-clip-text text-transparent">
                {displayText}
              </span>
              <span className="text-pink-500 animate-bounce">💖</span>
            </h4>
          )}
          {subtext && (
            <p className="text-xs font-semibold text-rose-500/90 dark:text-pink-300/80 leading-relaxed">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* ========================================================================
   MAIN COMPONENT: LoadingState (Tự động nhận dạng Theme hoặc theo Variant)
   ======================================================================== */
export const LoadingState: React.FC<LoadingStateProps> = ({
  variant,
  ...props
}) => {
  let activeTheme: string | undefined = undefined;
  try {
    const { theme } = useTheme();
    activeTheme = theme;
  } catch (e) {
    // Fallback if rendered outside ThemeProvider
  }

  const activeVariant = resolveLoadingVariant(variant, activeTheme);

  if (activeVariant === "pink") {
    return <PinkLoader {...props} />;
  }
  return <DarkLoader {...props} />;
};
