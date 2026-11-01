/**
 * Instagram URL helpers for Reels and Posts
 */

export const getInstagramShortcode = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(
    /(?:instagram\.com\/(?:reel|reels|p|share\/reel)\/|instagr\.am\/(?:reel|reels|p)\/)([A-Za-z0-9_-]+)/i
  );
  return match ? match[1] : null;
};

export const getInstagramEmbedUrl = (url) => {
  const shortcode = getInstagramShortcode(url);
  if (!shortcode) return null;
  return `https://www.instagram.com/reel/${shortcode}/embed/`;
};

export const isInstagramUrl = (url) => {
  return Boolean(getInstagramShortcode(url));
};

