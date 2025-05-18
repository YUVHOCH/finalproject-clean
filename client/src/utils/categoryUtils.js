export const generateSlug = (name) => {
  if (!name) return '';
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0590-\u05FF-]/g, '') // שומר על אותיות עברית ואנגלית ומקף
    .toLowerCase();
};

export const ensureCategorySlug = (category) => {
  if (!category) return null;
  if (!category.slug && category.categoryName) {
    category.slug = generateSlug(category.categoryName);
  }
  return category;
}; 