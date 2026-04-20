const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const savePreferences = async (req,res) => {
    const {userId} = req.params;
    const {preferences} = req.body;
    try {
        await prisma.UserPreference.upsert({
            where: {userId: parseInt(userId)},
            update: {preferences: JSON.stringify(preferences)},
            create: {
                userId: parseInt(userId),
                preferences: JSON.stringify(preferences)
            }
        });
        return res.json({message: "preferences saved"});




    }catch(error){
        return res.status(500).json({
            message: "Error saving preferences",
            error: error.message
        });

    }

}

const getRecommendations = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const userPref = await prisma.userPreference.findUnique({
      where: { userId }
    });

    // Step 1: Fallback (no preferences)
    if (!userPref) {
      const popular = await prisma.product.findMany({
        take: 10,
        orderBy: [
          { rating: 'desc' },
          { salesCount: 'desc' }
        ]
      });

      return res.json({ recommendations: popular, source: "popular" });
    }

    const prefs = JSON.parse(userPref.preferences || "{}");

    // Step 2: Build dynamic filters
    const whereClause = {};
    
    const orders = await prisma.order.findMany({
        where: { customerId: userId },
        include: { items: true }
    });
    const purchasedCategories = orders.flatMap(o =>
         o.items.map(i => i.category)
    );


    if (prefs.categories?.length) {
      whereClause.category = { in: prefs.categories };
    }

    if (prefs.priceRange) {
      whereClause.price = {
        gte: prefs.priceRange.min || 0,
        lte: prefs.priceRange.max || Number.MAX_SAFE_INTEGER
      };
    }

    if (prefs.brands?.length) {
      whereClause.brand = { in: prefs.brands };
    }

    //  Step 3: Fetch broader candidate pool
    const products = await prisma.product.findMany({
      where: whereClause,
      take: 100 // bigger pool for better ranking
    });

    //  Step 4: Score products (CORE IMPROVEMENT)
    const scored = products.map(product => {
      let score = 0;

      // Category match
      if (prefs.categories?.includes(product.category)) {
        score += 3;
      }

      // Brand match
      if (prefs.brands?.includes(product.brand)) {
        score += 2;
      }
      // purchase hist match
      if (purchasedCategories.includes(product.category)) {
       score += 3;
      }

      // Price closeness
      if (prefs.priceRange) {
        const mid = (prefs.priceRange.min + prefs.priceRange.max) / 2;
        const diff = Math.abs(product.price - mid);
        score += Math.max(0, 2 - diff / 10000); // normalize
      }

      // Product quality signals
      score += product.rating * 1.5;

      return { ...product, score };
    });

    //  Step 5: Sort by score
    const sorted = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    //  Step 6: Fallback if empty
    if (sorted.length === 0) {
      const fallback = await prisma.product.findMany({
        take: 10,
        orderBy: [
          { rating: 'desc' },
          { salesCount: 'desc' }
        ]
      });

      return res.json({ recommendations: fallback, source: "fallback" });
    }

    return res.json({
      recommendations: sorted,
      source: "personalized"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error getting recommendations",
      error: error.message
    });
  }
};
module.exports = { savePreferences, getRecommendations };