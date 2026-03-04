export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const key = process.env.GNEWS_API_KEY;
  const categories = ["general", "politics", "technology", "business", "science", "world"];

  try {
    // Fetch all categories in parallel
    const results = await Promise.all(
      categories.map(cat =>
        fetch(`https://gnews.io/api/v4/top-headlines?category=${cat}&lang=en&country=us&max=10&apikey=${key}`)
          .then(r => r.json())
          .then(d => d.articles || [])
          .catch(() => [])
      )
    );

    // Merge and deduplicate by URL
    const seen = new Set();
    const articles = results.flat().filter(a => {
      if (!a.title || !a.url || seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    return res.status(200).json({ articles, totalArticles: articles.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
