import React, { useState, useEffect } from 'react';
import styles from '../styles/Jobs.module.css';
import SearchStrip from '../components/SearchStrip';
import useScrollDirection from '../hooks/useScrollDirection';
import axios from 'axios';

const Jobs = () => {
  const scrollDirection = useScrollDirection();
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

  const jobs = [
    {
      id: 1,
      title: "משרה חמה למרלו\"ג שלנו",
      location: "מרלו\"ג",
      type: "קליטה מיידית",
      description: "דרושים צוותי ליקוט, הפצה ומלגזנים.",
      benefits: [
        "אווירה משפחתית",
        "אפשרויות קידום",
        "ארוחות מסובסדות"
      ],
      contact: {
        email: "meirav.i@hagarin.co.il",
        phone: "054-6752416"
      }
    },
    {
      id: 2,
      title: "אנשי/ות מכירות",
      location: "סניפי הרשת",
      type: "משרה מלאה",
      description: "מתן שירות ומכירה ללקוחות הסניף, עבודה מול מחשב וקופה, סדר וארגון הסניף והמחסן.",
      benefits: [
        "אפשרויות קידום לעתודה ניהולית",
        "בונוסים על מכירות",
        "בונוס התמדה",
        "קליטה ישירה לחברה משפחתית"
      ],
      requirements: [
        "ניסיון בתפקיד דומה",
        "בעל/ת רקע טכני",
        "ניסיון במכירות/שירות לקוחות – חובה"
      ],
      workHours: "ימים א'-ה' 8:00-17:00, יום ו' 8:00-13:00 + נכונות לשעות נוספות",
      contact: {
        email: "Meirav.i@hagarin.co.il",
        phone: "054-6752416"
      }
    },
    {
      id: 3,
      title: "צוותי ניהול לסניפי הגרעין",
      location: "סניפי הרשת",
      type: "משרה מלאה",
      description: "אחריות מלאה על ניהול ותפעול הסניף",
      responsibilities: [
        "ניהול צוות העובדים, יעדים ותוצאות",
        "שירות ומכירה ללקוחות החנות",
        "אחריות על המלאי והזמנת סחורה",
        "קשרי עבודה עם סוכנים וקניינים",
        "גיוס, הכשרה והדרכת עובדים חדשים"
      ],
      requirements: [
        "ניסיון בניהול צוות עובדים - חובה",
        "ניסיון במכירות ועמידה ביעדים – חובה",
        "ניסיון בתחום הקמעונאות – יתרון",
        "תודעת שירות גבוהה - חובה",
        "זיקה לתחום החקלאות והגינון – יתרון"
      ],
      workHours: "משרה מלאה – ימים א-ו",
      benefits: ["תנאים מעולים כולל מענקי התמדה ובונוסים"],
      contact: {
        email: "Meirav.i@hagarin.co.il",
        phone: "054-6752416"
      }
    }
  ];

  return (
    <>
      <div className={`${styles.stickyHeader} ${scrollDirection === "down" ? styles.hideHeader : ""}`}>
        <SearchStrip categories={categories} />
      </div>
      
      <div className={styles.container}>
        <h1 className={styles.title}>דרושים</h1>
        <div className={styles.jobsGrid}>
          {jobs.map(job => (
            <div key={job.id} className={styles.jobCard}>
              <h2 className={styles.jobTitle}>{job.title}</h2>
              <div className={styles.jobDetails}>
                <p className={styles.location}>📍 {job.location}</p>
                <p className={styles.type}>⏰ {job.type}</p>
              </div>
              <p className={styles.description}>{job.description}</p>
              
              {job.responsibilities && (
                <div className={styles.requirements}>
                  <h3>תחומי אחריות:</h3>
                  <ul>
                    {job.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requirements && (
                <div className={styles.requirements}>
                  <h3>דרישות התפקיד:</h3>
                  <ul>
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.benefits && (
                <div className={styles.benefits}>
                  <h3>אנחנו מציעים:</h3>
                  <ul>
                    {job.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.workHours && (
                <div className={styles.workHours}>
                  <h3>שעות עבודה:</h3>
                  <p>{job.workHours}</p>
                </div>
              )}

              <div className={styles.contact}>
                <h3>ליצירת קשר:</h3>
                <p>מייל: {job.contact.email}</p>
                <p>טלפון: {job.contact.phone}</p>
              </div>

              <button className={styles.applyButton} onClick={() => window.location.href = `mailto:${job.contact.email}`}>
                שליחת קורות חיים
              </button>
            </div>
          ))}
        </div>
        <p className={styles.disclaimer}>* המשרות מיועדות לנשים ולגברים כאחד</p>
      </div>
    </>
  );
};

export default Jobs; 