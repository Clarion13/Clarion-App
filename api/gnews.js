export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // LEFT-leaning RSS feeds
  const LEFT_FEEDS = [
    { url: "https://feeds.npr.org/1001/rss.xml",                        source: "NPR" },
    { url: "https://www.theguardian.com/us-news/rss",                   source: "The Guardian" },
    { url: "https://feeds.washingtonpost.com/rss/national",             source: "Washington Post" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", source: "New York Times" },
    { url: "https://www.huffpost.com/section/front-page/feed",          source: "HuffPost" },
  ];

  // CENTER / wire-service RSS feeds
  const CENTER_FEEDS = [
    { url: "https://feeds.reuters.com/reuters/topNews",                 source: "Reuters" },
    { url: "https://feeds.bbci.co.uk/news/rss.xml",                    source: "BBC News" },
    { url: "https://apnews.com/rss/apf-topnews",                       source: "AP News" },
  ];

  // RIGHT-leaning RSS feeds
  const RIGHT_FEEDS = [
    { url: "https://feeds.foxnews.com/foxnews/latest",                  source: "Fox News" },
    { url: "https://nypost.com/feed/",                                  source: "NY Post" },
    { url: "https://www.washingtonexaminer.com/feed",                   source: "Washington Examiner" },
    { url: "https://www.dailywire.com/feeds/rss.xml",                   source: "Daily Wire" },
    { url: "https://www.breitbart.com/feed/",                          source: "Breitbart" },
  ];

  function extractImage(item) {
    // Try every common RSS image pattern in order of reliability

    // 1. <media:content url="..."> or <media:thumbnail url="...">
    const mediaContent = item.match(/<media:content[^>]+url=["']([^"']+)["']/i)?.[1];
    if (mediaContent && mediaContent.match(/\.(jpg|jpeg|png|webp)/i)) return mediaContent;

    const mediaThumbnail = item.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)?.[1];
    if (mediaThumbnail && mediaThumbnail.match(/\.(jpg|jpeg|png|webp)/i)) return mediaThumbnail;

    // 2. <enclosure url="..." type="image/...">
    const enclosure = item.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/i)?.[1];
    if (enclosure) return enclosure;

    // 3. <image><url>...</url></image> inside item
    const imageTag = item.match(/<image>\s*<url>(https?[^<]+)<\/url>/i)?.[1];
    if (imageTag) return imageTag;

    // 4. og:image or any https image URL inside description/content
    const descBlock = item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ||
                      item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i)?.[1] || "";
    const imgInDesc = descBlock.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/i)?.[0];
    if (imgInDesc) return imgInDesc;

    // 5. Any https image URL anywhere in the item
    const anyImg = item.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/i)?.[0];
    if (anyImg) return anyImg;

    return null;
  }

  function parseRSS(xml, sourceName) {
    const items = [];
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    itemMatches.slice(0, 6).forEach(item => {
      const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                     item.match(/<title>(.*?)<\/title>/))?.[1]?.trim();
      const link  = (item.match(/<link>(.*?)<\/link>/) ||
                     item.match(/<guid>(https?[^<]+)<\/guid>/))?.[1]?.trim();
      const desc  = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                     item.match(/<description>(.*?)<\/description>/))?.[1]
                    ?.replace(/<[^>]+>/g, "").trim().slice(0, 200);
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim();
      const image = extractImage(item);

      if (title && link && !title.includes("<?xml")) {
        items.push({
          title,
          url: link,
          description: desc || "",
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          image,
          source: { name: sourceName }
        });
      }
    });
    return items;
  }

  async function fetchFeeds(feeds) {
    const results = await Promise.all(
      feeds.map(feed =>
        fetch(feed.url, { headers: { "User-Agent": "Mozilla/5.0" } })
          .then(r => r.text())
          .then(xml => parseRSS(xml, feed.source))
          .catch(() => [])
      )
    );
    return results.flat();
  }

  try {
    const [leftArticles, centerArticles, rightArticles] = await Promise.all([
      fetchFeeds(LEFT_FEEDS),
      fetchFeeds(CENTER_FEEDS),
      fetchFeeds(RIGHT_FEEDS),
    ]);

    // Cap each group equally so no lean dominates
    const CAP = 13;
    const balanced = [
      ...leftArticles.slice(0, CAP),
      ...centerArticles.slice(0, CAP),
      ...rightArticles.slice(0, CAP),
    ];

    // Shuffle so articles are interleaved, not grouped by lean
    for (let i = balanced.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [balanced[i], balanced[j]] = [balanced[j], balanced[i]];
    }

    // Deduplicate by URL
    const seen = new Set();
    const articles = balanced.filter(a => {
      if (!a.title || !a.url || seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    return res.status(200).json({ articles, totalArticles: articles.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
