const axios = require('axios');

exports.fetchBarcodeData = async (barcodeId) => {
  try {
    const res = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcodeId}.json`,
      { timeout: 8000 }
    );

    const data = res.data;
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments || {};

    return {
      barcodeId,
      productName: p.product_name || p.product_name_en || '',
      brand: p.brands || '',
      suggestedCategory: guessCategory(p),
      nutrition: {
        calories: n['energy-kcal_100g'] || null,
        protein:  n['proteins_100g'] || null,
        fat:      n['fat_100g'] || null,
        carbs:    n['carbohydrates_100g'] || null,
        fiber:    n['fiber_100g'] || null,
      },
    };
  } catch (err) {
    console.log('Barcode fetch error:', err.message);
    return null;
  }
};

const guessCategory = (product) => {
  const tags = [
    ...(product.categories_tags || []),
    ...(product.food_groups_tags || []),
  ].join(' ').toLowerCase();

  if (tags.includes('beverage') || tags.includes('drink') || tags.includes('milk')) return 'beverage';
  if (tags.includes('frozen')) return 'frozen';
  if (tags.includes('meat') || tags.includes('fish') || tags.includes('egg')) return 'protein';
  if (tags.includes('dairy') || tags.includes('cheese') || tags.includes('yogurt')) return 'dairy';
  if (tags.includes('vegetable') || tags.includes('fruit')) return 'produce';
  return 'other';
};