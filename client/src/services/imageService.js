import fs from 'fs';
import path from 'path';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

// בדיקה אם קובץ קיים
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error('Error checking file existence:', err);
    return false;
  }
};

// מציאת תמונה ראשית למוצר
export const findMainProductImage = (sku) => {
  // נסה למצוא קודם תמונה ללא קו תחתון
  for (const ext of VALID_EXTENSIONS) {
    const mainImagePath = `/images/${sku}${ext}`;
    if (fileExists(path.join(IMAGES_DIR, `${sku}${ext}`))) {
      return mainImagePath;
    }
  }

  // אם לא נמצאה, חפש את הראשונה עם קו תחתון
  const files = fs.readdirSync(IMAGES_DIR);
  const matchingFiles = files.filter(file => {
    const baseName = path.parse(file).name;
    return baseName.startsWith(`${sku}_`) && VALID_EXTENSIONS.includes(path.parse(file).ext.toLowerCase());
  });

  if (matchingFiles.length > 0) {
    return `/images/${matchingFiles[0]}`;
  }

  return null;
};

// מציאת כל תמונות המוצר (thumbnails)
export const findProductThumbnails = (sku) => {
  try {
    const files = fs.readdirSync(IMAGES_DIR);
    const thumbnails = files
      .filter(file => {
        const baseName = path.parse(file).name;
        const ext = path.parse(file).ext.toLowerCase();
        return baseName.startsWith(`${sku}_`) && VALID_EXTENSIONS.includes(ext);
      })
      .map(file => `/images/${file}`);

    return thumbnails;
  } catch (err) {
    console.error('Error finding product thumbnails:', err);
    return [];
  }
};

// בדיקה אם תמונה קיימת
export const checkImageExists = async (imagePath) => {
  try {
    const fullPath = path.join(IMAGES_DIR, imagePath);
    return fileExists(fullPath);
  } catch (err) {
    console.error('Error checking image existence:', err);
    return false;
  }
};

// קבלת כל תמונות המוצר (ראשית + thumbnails)
export const getProductImages = (sku) => {
  const mainImage = findMainProductImage(sku);
  const thumbnails = findProductThumbnails(sku);
  
  return {
    main: mainImage || (thumbnails.length > 0 ? thumbnails[0] : null),
    thumbnails: thumbnails
  };
}; 