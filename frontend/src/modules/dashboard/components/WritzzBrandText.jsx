import { useEffect, useState } from "react";

/**
 * Premium animated Writzz brand text transition component.
 * Letter-by-letter reveal (W -> Wr -> Wri -> Writ -> Writt -> Writzz)
 * with subtle fade, slide, scale, and prefers-reduced-motion support.
 */
export default function WritzzBrandText({ className = "", size = "md" }) {
  const fullText = "Writzz";
  const [visibleCount, setVisibleCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setReducedMotion(true);
      setVisibleCount(fullText.length);
      return;
    }

    // Step by step letter reveal across ~750ms
    const intervalTime = 750 / fullText.length;
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= fullText.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const sizeClasses = {
    sm: "text-lg font-display tracking-wide",
    md: "text-2xl font-display tracking-tight sm:text-3xl",
    lg: "text-4xl font-display tracking-tight sm:text-5xl",
  };

  if (reducedMotion) {
    return (
      <span className={`inline-block font-bold text-ink-900 ${sizeClasses[size] || sizeClasses.md} ${className}`}>
        Writzz<span className="text-terracotta-600">.</span>
      </span>
    );
  }

  return (
    <span
      className={`group inline-flex items-center font-bold text-ink-900 transition-all duration-300 ${sizeClasses[size] || sizeClasses.md} ${className}`}
      aria-label="Writzz"
    >
      {fullText.split("").map((char, index) => {
        const isVisible = index < visibleCount;
        return (
          <span
            key={index}
            className={`inline-block transition-all duration-300 ease-out transform ${
              isVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-1 scale-95"
            } ${index >= 4 ? "text-terracotta-600" : ""}`}
          >
            {char}
          </span>
        );
      })}
      <span
        className={`ml-0.5 inline-block text-terracotta-600 transition-opacity duration-300 ${
          visibleCount === fullText.length ? "opacity-100 animate-pulse" : "opacity-0"
        }`}
      >
        .
      </span>
    </span>
  );
}
