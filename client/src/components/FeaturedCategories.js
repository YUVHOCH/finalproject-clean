import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Home.module.css';

const FeaturedCategories = () => {
  const categories = [
    {
      name: "מבצעים",
      image: "/homecategories/sale.jpg",
      link: "/sales",
      isExternal: false
    },
    {
      name: "Husqvarna Israel",
      image: "/homecategories/husqvarna.jpg",
      link: "https://husqvarnaisrael.co.il/",
      isExternal: true
    },
    {
      name: "מחשבי השקייה",
      image: "/homecategories/computers.jpg",
      link: "/category/מחשבי-השקייה",
      isExternal: false
    },
    {
      name: "כלים נטענים",
      image: "/homecategories/rechargeable.jpg",
      link: "/category/נטענים-ikra-20v",
      isExternal: false
    },
    {
      name: "מרססים",
      image: "/homecategories/sprayers.jpg",
      link: "/category/מרסס-גב-עד-20-ליטר",
      isExternal: false
    },
    {
      name: "הדברת עשבים",
      image: "/homecategories/grasspest.jpg",
      link: "/category/הדברת-עשבים",
      isExternal: false
    },
    {
      name: "דשא סינטטי",
      image: "/homecategories/grass.jpg",
      link: "/category/דשא-סנטטי",
      isExternal: false
    },
    {
      name: "מכסחות דשא",
      image: "/homecategories/lawnmowers.jpg",
      link: "/category/מכסחות-דשא",
      isExternal: false
    },
    {
      name: "חרמשים",
      image: "/homecategories/trimmers.jpg",
      link: "/category/חרמשים",
      isExternal: false
    },
    {
      name: "מפוחי עלים",
      image: "/homecategories/blowers.jpg",
      link: "/category/מפוח-שואב-עלים",
      isExternal: false
    },
  
    {
      name: "הדברת נמלים",
      image: "/homecategories/ants.jpg",
      link: "/category/הדברת-נמלים",
      isExternal: false
    },
    {
      name: "דישון לגינה",
      image: "/homecategories/fertilisers.jpg",
      link: "/category/דישון-לגינה",
      isExternal: false
    }
  ];

  const CategoryLink = ({ category, children }) => {
    // אם זה לינק חיצוני או URL מלא
    if (category.isExternal || category.link.startsWith('http')) {
      return (
        <a 
          href={category.link}
          className={styles.categoryCard}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }

    // אם זה לינק פנימי
    return (
      <Link 
        to={category.link} 
        className={styles.categoryCard}
        onClick={() => window.scrollTo(0, 0)}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className={styles.featuredCategories}>
      <h2 className={styles.featuredTitle}>הקטגוריות שלנו</h2>
      <div className={styles.categoriesGrid}>
        {categories.map((category, index) => (
          <CategoryLink 
            key={index}
            category={category}
          >
            <div className={styles.categoryImageWrapper}>
              <img 
                src={category.image}
                alt={category.name} 
                className={styles.categoryImage}
                onError={(e) => {
                  if (e.target.src.endsWith('.png')) {
                    e.target.src = category.image.replace('.png', '.jpg');
                  }
                }}
              />
            </div>
            <span className={styles.categoryName}>{category.name}</span>
          </CategoryLink>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCategories; 