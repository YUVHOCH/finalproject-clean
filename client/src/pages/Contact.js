import React, { useState, useEffect } from 'react';
import styles from '../styles/Contact.module.css';
import contactImage from '../assets/contact.jpg';
import SearchStrip from '../components/SearchStrip';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:8000/products");
        const data = Array.isArray(res.data) ? res.data : res.data.products || [];
        const cats = data.map(p => ({
          category: p.category,
          subcategory: p.subcategory,
          subsubcategory: p.subsubcategory
        }));
        setCategories(cats);
      } catch (err) {
        console.error("שגיאה בטעינת קטגוריות", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // כאן יהיה הטיפול בשליחת הטופס
    console.log(formData);
  };

  return (
    <>
      <SearchStrip categories={categories} />
      <div className={styles.contactContainer}>
        <div className={styles.imageSection}>
          <img src={contactImage} alt="איש עובד בגינה" />
          <div className={styles.detailsCard}>
            <h2>פרטי התקשרות</h2>
            
            <div className={styles.contactDetail}>
              <span className={styles.icon}>📞</span>
              <div>
                <p>טל' למחלקת אינטרנט</p>
                <p>08-9320466</p>
              </div>
            </div>

            <div className={styles.contactDetail}>
              <span className={styles.icon}>📞</span>
              <div>
                <p>משרדי החברה</p>
                <p>08-9320400</p>
              </div>
            </div>

            <div className={styles.contactDetail}>
              <span className={styles.icon}>🕒</span>
              <div>
                <p>שעות פעילות</p>
                <p>09:00-16:00 ימים א'-ה'</p>
              </div>
            </div>

            <div className={styles.contactDetail}>
              <span className={styles.icon}>📍</span>
              <div>
                <p>כתובתנו</p>
                <p>רח' נחל חריף 2, יבנה</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.breadcrumbs}>
            <a href="/">דף הבית</a> / צור קשר
          </div>
          <h1>צור איתנו קשר</h1>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">שם *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">דוא"ל *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">מס' טלפון *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject">נושא</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">הודעה</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              שליחה
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Contact; 