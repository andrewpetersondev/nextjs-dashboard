"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
  useEffect(() => {
    const storedTheme = JSON.parse(localStorage.getItem("theme") || "false");
    document.documentElement.setAttribute(
      "data-theme",
      storedTheme ? "dark" : "light",
    );
  }, []);

  return null;
}