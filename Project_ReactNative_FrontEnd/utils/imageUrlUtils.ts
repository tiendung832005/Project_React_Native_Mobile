import { API_BASE_URL } from '../constants/config';

/**
 * Normalize image URL - replace old IP with current IP from config
 * This fixes issues when IP changes (e.g., switching between home/office network)
 * 
 * @param imageUrl - The image URL from backend (may contain old IP)
 * @returns Normalized image URL with current IP
 */
export function normalizeImageUrl(imageUrl: string | undefined | null): string | undefined {
  if (!imageUrl) {
    return undefined;
  }

  // Extract base URL from API_BASE_URL (remove /api)
  const baseUrl = API_BASE_URL.replace('/api', '');
  
  // Check if URL contains /uploads/ path
  if (imageUrl.includes('/uploads/')) {
    // Extract the filename/path after /uploads/
    const uploadsMatch = imageUrl.match(/\/uploads\/(.+)$/);
    if (uploadsMatch) {
      const filePath = uploadsMatch[1];
      // Return normalized URL with current base URL
      return `${baseUrl}/uploads/${filePath}`;
    }
  }

  // If it's already a full URL but with different IP, replace it
  // Match pattern: http://192.168.x.x:8080/uploads/...
  const ipPattern = /http:\/\/192\.168\.\d+\.\d+:8080/;
  if (ipPattern.test(imageUrl)) {
    return imageUrl.replace(ipPattern, baseUrl);
  }

  // If it's a relative path starting with /uploads/, add base URL
  if (imageUrl.startsWith('/uploads/')) {
    return `${baseUrl}${imageUrl}`;
  }

  // Return as-is if it doesn't match any pattern
  return imageUrl;
}

/**
 * Normalize multiple image URLs at once
 */
export function normalizeImageUrls(imageUrls: (string | undefined | null)[]): (string | undefined)[] {
  return imageUrls.map(url => normalizeImageUrl(url));
}

