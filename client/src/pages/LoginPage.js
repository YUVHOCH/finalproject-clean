/*pages/Loginpage*/
import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import { useTranslation } from "react-i18next";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();

  // 📤 פונקציית התחברות
  const handleLogin = async (event) => {
    event.preventDefault(); // ❌ מונע רענון דף

    console.log("📤 נשלח לשרת:", { username, password });

    try {
      const response = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Login successful!");
        console.log("🔐 Token:", data.token);

        // 🧠 שמירת הטוקן והשם ב־localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));


        // לדוגמה: מעבר לדף admin אחרי התחברות
        if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/"; // או עמוד בית רגיל
        }
      } else {
        console.log("🔴 Login response error:", data);
        alert("❌ Login failed: " + (data.message || JSON.stringify(data)));
      }
    } catch (error) {
      console.error("❌ Error during login:", error);
      alert("❌ Error during login: " + error.message);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.titles}>
      <h2 style={{ color: "blue", textDecoration: "underline" }}>{t("login.title")}</h2>
      <p>{t("login.subtitle")}</p>

      </div>

      <form className={styles.loginForm} onSubmit={handleLogin}>
        <div className={styles.formRow}>
        <label htmlFor="username">{t("login.username")}:</label>
           <input
            type="text"
            id="username"
            name="username"
            placeholder={t("login.password")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>

        <div className={styles.formRow}>
        <label htmlFor="password">סיסמה:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
        <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>

        <button type="submit" className={styles.button}> {t("login.submit")}</button>
      </form>
    </div>
  );
}
