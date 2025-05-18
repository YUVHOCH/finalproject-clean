/*server/registers.js*/
import React, { useState } from "react";
import styles from "../styles/Register.module.css";
import cleanerpic from "../assets/pic.png";
import { useTranslation } from "react-i18next";


export default function RegistrationForm() {
    
    const [termsChecked, setTermsChecked] = useState(false);
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [fname, setFname] = useState("")
    const [lname, setLname] = useState("")
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { t } = useTranslation();
    
    const handlePhoneChange = (e) => {
        let input = e.target.value.replace(/\s+/g, ""); // הסרת רווחים
        const phonePattern = /^\d{2,3}-?\d{6,7}$/; // ביטוי רגולרי לתבנית
    
        if (input === "") {
            setPhoneError("Phone number is required.");
            setPhone(input);
            return;
        }
    
        if (input.length > 11) {
            setPhoneError("Phone number must be between 8-11 characters.");
            setPhone(input);
            return;
        }
    
        if (/[^0-9-]/.test(input)) {
            setPhoneError("Only numbers and a single dash ('-') are allowed.");
            setPhone(input);
            return;
        }
    
        setPhone(input);
    
        if (phonePattern.test(input)) {
            setPhoneError(""); // הקלט תקין - אין שגיאה
        } else {
            setPhoneError("Invalid phone format. Use XXX-XXXXXXX.");
        }
    };
    
    const handleSubmit = (event) => {
        event.preventDefault();
    if (phoneError || phone.length < 8) { 
        event.preventDefault(); // ❌ מונע שליחת טופס אם מספר הטלפון לא תקין
        alert("Invalid phone number! Please correct it before submitting.");
        return;
    }

    if (!termsChecked) {
        event.preventDefault(); // ❌ מונע שליחת טופס אם התנאים לא סומנו
        alert("You must agree to the terms and conditions!");
        return;
    }
    
    if (
        !/^[A-Za-z]+$/.test(fname) ||
        !/^[A-Za-z]+$/.test(lname) ||
        fname.length < 2 || fname.length > 12 ||
        lname.length < 2 || lname.length > 12
      ) {
        event.preventDefault();
        alert("You must enter a valid name!");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }
      
      if (!/[A-Za-z]/.test(password)) {
        alert("Password must contain at least one letter.");
        return;
      }
      
      if (!/\d/.test(password)) {
        alert("Password must contain at least one number.");
        return;
      }
      
      fetch("http://localhost:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          name: fname + " " + lname,
          email: document.getElementById("email").value,
          phone: phone,
          birth_date: document.getElementById("birth").value,
          subscribe: document.getElementById("subscribe").checked,
          status: true,
          isAdmin: false,
          role: "user", // 🆕 אם אתה רוצה להגדיר role כבר עכשיו
          preferences: {
            page_size: 12,
          }
        }),
      })
        .then((res) => res.json())
        .then((response) => {
          console.log("User saved:", response);
          alert("User saved to DB!");
      
          // 🧠 שמירת כל פרטי המשתמש ב־localStorage
          localStorage.setItem("user", JSON.stringify(response));
      
          // ✅ ניווט לפי הרשאות
          if (response.role === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }
        })
        .catch((err) => {
          console.error("Error saving user:", err);
          alert("Failed to save user!");
        });
    };

    return (
      <div className={styles.page}>
        <div className={styles.formContainer}>
          <div className={styles.leftsection}>
            <div className={styles.registerForm}>
              <h2 style={{ color: "blue", textDecoration: "underline"}}>
                {t("register.title")}
              </h2>
              <p>{t("register.subtitle")}</p>
    
              <form style={{ display: "flex", flexDirection: "column", maxWidth: "500px" }} onSubmit={handleSubmit}>
                <label htmlFor="fname">{t("register.firstName")} <span style={{ color: "red" }}>*</span></label>
                <input
                  type="text"
                  id="fname"
                  name="fname"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  placeholder={t("register.firstName")}
                  required
                  className={styles.inputField}
                />
    
                <label htmlFor="lname">{t("register.lastName")} <span style={{ color: "red" }}>*</span></label>
                <input
                  type="text"
                  id="lname"
                  name="lname"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  placeholder={t("register.lastName")}
                  required
                  className={styles.inputField}
                />
    
                <label htmlFor="phone">{t("register.phone")} <span style={{ color: "red" }}>*</span></label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder={t("")}
                  maxLength={11}
                  required
                  className={styles.inputField}
                />
                {phoneError && <p style={{ color: "red" }}>{phoneError}</p>}
    
                <label htmlFor="email">{t("register.email")} <span style={{ color: "red" }}>*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder={t("register.email")}
                  required
                  className={styles.inputField}
                />
    
                <label htmlFor="birth">{t("register.birthDate")}</label>
                <input type="date" id="birth" name="birth" className={styles.inputField} />

                <div className={styles.genderGroup}>
                <label>{t("register.gender")}</label>
                <label><input type="radio" name="gender" value="Male" /> {t("register.male")}</label>
                 <label><input type="radio" name="gender" value="Female" /> {t("register.female")}</label>
                </div>
    
                <label htmlFor="Username">{t("register.username")}<span style={{ color: "red" }}>*</span></label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder={t("register.username")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={styles.inputField}
                />
    
                <label htmlFor="password">{t("register.password")} <span style={{ color: "red" }}>*</span></label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder={t("register.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.inputField}
                />
    
                <div className={styles.checkboxGroup}>
                <div>
                  <input type="checkbox" id="subscribe" name="subscribe" />
                  <label htmlFor="subscribe">{t("register.subscribe")}</label>
                </div>
    
                <div>
                  <input
                    type="checkbox"
                    id="terms_of_conditions"
                    name="terms_of_conditions"
                    required
                    onChange={(e) => setTermsChecked(e.target.checked)}
                  />
                  <label htmlFor="terms_of_conditions">
                    <span style={{ color: "red" }}>*</span> {t("register.terms")}
                  </label>
                  </div>
                  </div>
    
                <button type="submit" className={styles.button}>{t("register.submit")}</button>
                <p style={{ color: "red" }}>* {t("register.requiredField")}</p>
              </form>
            </div>
          </div>
    
          <div className={styles.rightsection}>
            <img src={cleanerpic} alt="cleaner pic" style={{ width: "1220px", height: "auto" }} />
          </div>
        </div>
      </div>
    );
  };