// server/routes/aiSearch.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Product = require('../models/Product');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    console.log('=== Starting AI Search ===');
    
    // שלב 1: חיפוש בסיסי מהיר
    const basicSearchResults = await Product.find({
      active: true,
      $or: [
        { productName: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { subcategory: { $regex: query, $options: 'i' } }
      ]
    }).lean();  // משתמשים ב-lean() לביצועים טובים יותר

    // שלב 2: יצירת embedding במקביל לחיפוש הבסיסי
    const embeddingPromise = openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query
    });

    // שלב 3: חיפוש סמנטי
    const [embeddingResponse] = await Promise.all([embeddingPromise]);
    const searchVector = embeddingResponse.data[0].embedding;

    // חיפוש מוצרים עם embeddings תקינים
    const semanticResults = await Product.aggregate([
      {
        $match: {
          active: true,
          shortEmb: { $exists: true, $ne: null },
          $expr: { $eq: [{ $size: "$shortEmb" }, searchVector.length] }
        }
      },
      {
        $addFields: {
          similarity: {
            $reduce: {
              input: { $range: [0, { $size: "$shortEmb" }] },
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $multiply: [
                      { $arrayElemAt: ["$shortEmb", "$$this"] },
                      { $arrayElemAt: [searchVector, "$$this"] }
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          similarity: { $gt: 0.7 }  // סף דמיון מינימלי
        }
      },
      {
        $sort: { similarity: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // שלב 4: מיזוג התוצאות
    const allProducts = [...new Set([...basicSearchResults, ...semanticResults])];
    
    // שלב 5: דירוג סופי
    const finalResults = allProducts
      .map(product => {
        let score = 0;
        
        // ציון מהחיפוש הבסיסי
        if (basicSearchResults.some(p => p._id.equals(product._id))) {
          score += 100;
        }

        // ציון מהחיפוש הסמנטי
        const semanticResult = semanticResults.find(p => p._id.equals(product._id));
        if (semanticResult?.similarity) {
          score += semanticResult.similarity * 100;
        }

        // בונוס למוצרים שמכילים את מילות החיפוש בשם
        if (product.productName?.toLowerCase().includes(query.toLowerCase())) {
          score += 50;
        }

        return {
          ...product,
          price: product.price || 0,  // טיפול במחיר null
          relevanceScore: score
        };
      })
      .filter(product => 
        // סינון תוצאות לא תקינות
        product.productName && 
        typeof product.price === 'number' && 
        !isNaN(product.price)
      )
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);  // מגביל ל-20 תוצאות

    return res.json({
      success: true,
      products: finalResults,
      totalFound: finalResults.length
    });

  } catch (error) {
    console.error('AI search error:', error);
    return res.status(500).json({
      error: 'AI search failed',
      message: error.message
    });
  }
});

module.exports = router;
