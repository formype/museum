/**
 * Tiện ích xử lý link YouTube cho học sinh xem video khám phá vũ trụ
 */

export function extractYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const cleaned = url.trim();
  // Match youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = cleaned.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  // Nếu người dùng chỉ nhập đúng 11 ký tự video ID
  if (/^[\w-]{11}$/.test(cleaned)) {
    return cleaned;
  }
  return null;
}

export function getYouTubeEmbedUrl(url?: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=0` : null;
}

export function getYouTubeThumbnailUrl(url?: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}
