const Brand = require('../models/Brand');

const initialBrands = [
  {
    name: 'rpc',
    title: 'פתרונות מתקדמים להובלת מים',
    description: 'מובילים בתחום אביזרי ההשקיה והצנרת, מציעים פתרונות מתקדמים ואיכותיים',
    position: 1
  },
  {
    name: 'plasfit',
    title: 'חדשנות בעולם ההשקיה',
    description: 'מגוון רחב של מוצרי השקיה איכותיים, פתרונות מתקדמים לגינון מקצועי',
    position: 2
  },
  {
    name: 'ikra',
    title: 'IKRA - איכות גרמנית במחירים משתלמים',
    description: 'מגוון רחב של כלי גינון משולבים למגזר הפרטי. מכסחות דשא, מפוחי עלים, חרמשים, מזמרות ועוד'
  },
  {
    name: 'husqvarna',
    title: '325 שנות ניסיון',
    description: 'המשוכה של Husqvarna לטוב ביותר נמשכת כבר 325 שנה. באמצעות מכונן מעולה והכוונות תכנות, מספקת פתרונות מתקדמים לגינון'
  },
  {
    name: 'hunter',
    title: 'מערכות השקיה מתקדמות',
    description: 'מותג מוביל בתחום ההשקיה המקצועית, מציע פתרונות חכמים ויעילים להשקיה אוטומטית'
  },
  {
    name: 'green',
    title: 'הכל לגינה שלך',
    description: 'מוצרי איכות לגינון, כלי עבודה ואביזרי השקיה במחירים משתלמים'
  },
  {
    name: 'gardena',
    title: 'My Garden My Passion',
    description: 'חברת Gardena גרמניה, מהמובילות בעולם בייצור פתרונות לגינה. כלי גינון משולבים וידניים, מוצרי השקיה ועוד'
  },
  {
    name: 'claber',
    title: 'פתרונות השקיה חכמים',
    description: 'מערכות השקיה חכמות ואיכותיות, מגוון פתרונות להשקיה אוטומטית ולגינון מקצועי'
  }
];

const initBrands = async () => {
  try {
    for (const brand of initialBrands) {
      await Brand.findOneAndUpdate(
        { name: brand.name },
        { ...brand, position: brand.position || 0 },
        { upsert: true }
      );
    }
    console.log('✅ Brands initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing brands:', error);
  }
};

module.exports = initBrands; 