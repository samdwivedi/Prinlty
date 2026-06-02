"use client";

import { useEffect } from "react";

export function SecurityWrapper() {
  useEffect(() => {
    // 1. Prevent right-click context menu
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", preventDefault);

    // 2. Prevent keyboard shortcuts (Ctrl+C, Ctrl+S, Ctrl+P, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        (e.key === "p" ||
          e.key === "s" ||
          e.key === "c" ||
          e.key === "u" ||
          e.key === "P" ||
          e.key === "S" ||
          e.key === "C" ||
          e.key === "U")
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // 3. Clear clipboard on PrintScreen key release
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        try {
          navigator.clipboard.writeText("Screenshots are disabled on Printly for security reasons.");
        } catch {
          // Ignore failures if clipboard API permission is not granted yet
        }
      }
    };
    window.addEventListener("keyup", handleKeyUp);

    // 4. Blur page when window loses focus (e.g. Snipping tool activation)
    const handleBlur = () => {
      document.body.style.filter = "blur(12px)";
      document.body.style.transition = "filter 0.15s ease-in-out";
    };

    const handleFocus = () => {
      document.body.style.filter = "none";
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return null;
}
