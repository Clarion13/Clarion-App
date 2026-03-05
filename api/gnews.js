export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const key = process.env.GNEWS_API_KEY;

  // RSS feeds for right-leaning outlets
  const RSS_FEEDS = [
    { url: "https://feeds.foxnews.com/foxnews/latest", source: "Fox News" },
    { url: "https://nypost.com/feed/", source: "NY Post" },
    { url: "https://www.breitbart.com/feed/", source: "Breitbart" },
    { url: "https://www.dailywire.com/feeds/rss.xml", source: "Daily Wire" },
    { url: "https://www.washingtonexaminer.com/feed", source: "Washington Examiner" },
  ];

  // Parse RSS XML to extract articles
  function parseRSS(xml, sourceName) {
    const items = [];
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    itemMatches.slice(0, 8).forEach(item => {
      const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                     item.match(/<title>(.*?)<\/title>/))?.[1]?.trim();
      const link  = (item.match(/<link>(.*?)<\/link>/) ||
                     item.match(/<guid>(https?[^<]+)<\/guid>/))?.[1]?.trim();
      const desc  = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                     item.match(/<description>(.*?)<\/description>/))?.[1]
                    ?.replace(/<[^>]+>/g, "").trim().slice(0, 200);
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim();
      if (title && link && !title.includes("<?xml")) {
        items.push({
          title,
          url: link,
          description: desc || "",
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          image: null,
          source: { name: sourceName }
        });
      }
    });
    return items;
  }

  try {
    // Fetch GNews categories + RSS feeds in parallel
    const gnewsCategories = ["general", "politics", "technology", "business", "world"];

    const [gnewsResults, ...rssResults] = await Promise.all([
      // GNews multi-category
      Promise.all(
        gnewsCategories.map(cat =>
          fetch(`https://gnews.io/api/v4/top-headlines?category=${cat}&lang=en&country=us&max=8&apikey=${key}`)
            .then(r => r.json())
            .then(d => d.articles || [])
            .catch(() => [])
        )
      ).then(r => r.flat()),

      // RSS feeds
      ...RSS_FEEDS.map(feed =>
        fetch(feed.url, { headers: { "User-Agent": "Mozilla/5.0" } })
          .then(r => r.text())
          .then(xml => parseRSS(xml, feed.source))
          .catch(() => [])
      )
    ]);

    // Merge and deduplicate
    const seen = new Set();
    const articles = [...gnewsResults, ...rssResults.flat()].filter(a => {
      if (!a.title || !a.url || seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    return res.status(200).json({ articles, totalArticles: articles.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
