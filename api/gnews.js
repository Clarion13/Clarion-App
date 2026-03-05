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

    const candidates = [];

    // 1. <media:content url="..."> — often has width attribute, prefer larger ones
    const mediaMatches = [...(item.matchAll(/<media:content[^>]+url=["']([^"']+)["'][^>]*/gi) || [])];
    mediaMatches.forEach(m => {
      const url = m[1];
      const widthMatch = m[0].match(/width=["']?(\d+)/i);
      const width = widthMatch ? parseInt(widthMatch[1]) : 500;
      if (url.match(/\.(jpg|jpeg|png|webp)/i)) candidates.push({ url, width });
    });
    // Pick largest media:content
    if (candidates.length) {
      candidates.sort((a,b) => b.width - a.width);
      if (isHDUrl(candidates[0].url)) return candidates[0].url;
    }

    // 2. <media:thumbnail url="...">
    const mediaThumbnail = item.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)?.[1];
    if (mediaThumbnail && mediaThumbnail.match(/\.(jpg|jpeg|png|webp)/i) && isHDUrl(mediaThumbnail)) return mediaThumbnail;

    // 3. <enclosure url="..." type="image/...">
    const enclosure = item.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/i)?.[1];
    if (enclosure && isHDUrl(enclosure)) return enclosure;

    // 4. <image><url>...</url></image>
    const imageTag = item.match(/<image>\s*<url>(https?[^<]+)<\/url>/i)?.[1];
    if (imageTag && isHDUrl(imageTag)) return imageTag;

    // 5. Any image URL inside description/content:encoded
    const descBlock = item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ||
                      item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i)?.[1] || "";
    const imgInDesc = descBlock.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/gi) || [];
    const hdFromDesc = imgInDesc.find(u => isHDUrl(u));
    if (hdFromDesc) return hdFromDesc;

    // 6. Last resort — any image URL anywhere, still must pass HD check
    const anyImgs = item.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/gi) || [];
    return anyImgs.find(u => isHDUrl(u)) || null;
  }

  // Reject URLs that are clearly thumbnails or low-res
  function isHDUrl(url) {
    if (!url) return false;
    const u = url.toLowerCase();
    // Reject known small size patterns
    const badPatterns = [
      /[_\-](\d{1,2}x\d{1,2})[_\-\.]/,   // e.g. _50x50.
      /[_\-](thumb|thumbnail|tiny|icon|avatar|favicon|logo|badge|pixel|spacer|placeholder)/,
      /\/(\d{1,2})x(\d{1,2})\//,            // /50x50/
    ];
    if (badPatterns.some(p => p.test(u))) return false;

    // Prefer URLs with explicit large dimensions in them
    const sizeMatch = u.match(/[_\-](\d{3,4})x(\d{3,4})/);
    if (sizeMatch) {
      const w = parseInt(sizeMatch[1]), h = parseInt(sizeMatch[2]);
      return w >= 400 && h >= 200;
    }

    // If no size info in URL, accept it (let the app do a final check)
    return true;
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
