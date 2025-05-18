// server/routes/aiSearch.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Product = require('../models/Product');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  console.log('=== Starting Enhanced AI Search (Safe Mode) ===');
  try {
    const { query } = req.body;
    console.log('Received query:', query);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `אתה עוזר ללקוח למצוא מוצרים מתאימים בחנות גינון.
נתח את הבקשה והחזר עד 10 מילות מפתח רלוונטיות לחיפוש (מותגים, סוגים, תיאורים, תקלות וכו').
החזר רק את המילים, מופרדות בפסיקים. בלי הסברים, בלי JSON.
אם יש תקציב, כלול מילים שמתאימות (למשל "זול", "מתחת ל־1000").`
        },
        {
          role: "user",
          content: query
        }
      ]
    });

    const keywordString = completion.choices[0].message.content;
    const searchTerms = keywordString
      .split(',')
      .map(term => term.trim())
      .filter(term => term.length > 1);

    console.log('AI keywords:', searchTerms);

    // בניית בקשת חיפוש
    const regexes = searchTerms.map(term => new RegExp(term, 'i'));
    const products = await Product.find({
  $or: searchTerms.map(term => ({
    $or: [
      { productName: { $regex: new RegExp(term, 'i') } },
      { description: { $regex: new RegExp(term, 'i') } },
      { shortDescription: { $regex: new RegExp(term, 'i') } },
      { longDescription: { $regex: new RegExp(term, 'i') } }
    ]
  }))
});
    return res.json({
      success: true,
      products,
      keywords: searchTerms
    });

  } catch (error) {
    console.error('❌ AI search error:', error);
    return res.status(500).json({
      error: 'AI search failed',
      message: error.message
    });
  }
});

module.exports = router;
