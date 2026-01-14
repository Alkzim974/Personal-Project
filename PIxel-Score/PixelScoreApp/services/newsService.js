export const fetchNews = async () => {
    const feeds = [
        { url: 'https://www.jeuxvideo.com/rss/rss.xml', source: 'JeuxVideo.com' },
        { url: 'https://fr.ign.com/feed.xml', source: 'IGN France' }
    ];

    try {
        const allNews = await Promise.all(feeds.map(async (feed) => {
            try {
                const response = await fetch(feed.url);
                const text = await response.text();
                return parseRSS(text, feed.source);
            } catch (e) {
                console.error(`Error fetching ${feed.source}:`, e);
                return [];
            }
        }));

        // Flatten and sort by date (newest first)
        const flatNews = allNews.flat().sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
        return flatNews;
    } catch (error) {
        console.error("Error in fetchNews:", error);
        return [];
    }
};

const parseRSS = (xml, source) => {
    const items = [];
    // Simple regex parsing to avoid weighty libraries
    // We look for <item> blocks
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const content = match[1];

        const title = extractTag(content, 'title');
        const link = extractTag(content, 'link');
        const pubDate = extractTag(content, 'pubDate');
        const description = extractTag(content, 'description');
        
        // Image extraction attempts
        let image = null;
        
        // 1. Try enclosure
        const enclosureMatch = /<enclosure[^>]*url="([^"]+)"/.exec(content);
        if (enclosureMatch) image = enclosureMatch[1];

        // 2. Try media:content
        if (!image) {
            const mediaMatch = /<media:content[^>]*url="([^"]+)"/.exec(content);
            if (mediaMatch) image = mediaMatch[1];
        }

        // 3. Try finding img tag in description (common in some feeds)
        if (!image && description) {
            const imgMatch = /<img[^>]+src="([^">]+)"/.exec(description);
            if (imgMatch) image = imgMatch[1];
        }

        // 4. Try media:thumbnail
        if (!image) {
             const thumbMatch = /<media:thumbnail[^>]*url="([^"]+)"/.exec(content);
             if (thumbMatch) image = thumbMatch[1];
        }


        // Specific cleanup for JV.com images (often small thumbnails in RSS, try to get bigger if possible or just accept it)
        // JV.com optimization: sometimes url contains sizing params we can remove/tweak
        
        if (title && link) {
            items.push({
                id: link, // Use link as ID
                title: cleanText(title),
                url: link,
                date: timeSince(new Date(pubDate)),
                isoDate: pubDate, // Kept for sorting
                source: source,
                image: image,
                snippet: cleanText(description).substring(0, 100) + '...'
            });
        }
    }
    return items;
};

const extractTag = (xml, tag) => {
    const regex = new RegExp(`<${tag}[^>]*>(<!\\[CDATA\\[)?([\\s\\S]*?)(\\]\\]>)?<\\/${tag}>`, 'i');
    const match = regex.exec(xml);
    return match ? match[2].trim() : null;
};

const cleanText = (html) => {
    if (!html) return '';
    // Remove CDATA
    let text = html.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, '');
    // Decode entities (basic ones)
    text = text.replace(/&quot;/g, '"')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&#039;/g, "'")
               .replace(/&nbsp;/g, ' ');
    return text.trim();
};

const timeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " an(s)";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mois";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " j";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min";
    return "À l'instant";
};
