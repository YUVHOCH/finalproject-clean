// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import he from "./locales/he.json"; // ✅ ייבוא יחיד

i18n
  .use(initReactI18next)
  .init({
    resources: {
      he: {
        translation: he  // ✅ שימוש באובייקט שכבר ייבאת
      },
    },
    lng: "he",
    fallbackLng: "he",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
