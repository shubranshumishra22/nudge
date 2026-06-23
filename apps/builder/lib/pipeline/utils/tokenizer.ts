export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  // Try to truncate at a sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastComma = truncated.lastIndexOf(',');
  const lastSpace = truncated.lastIndexOf(' ');

  const boundary = Math.max(lastPeriod, lastComma, lastSpace);
  if (boundary > maxLength * 0.7) { // If we can find a reasonable boundary
    return text.substring(0, boundary + 1);
  }

  return truncated + '...';
}

export function truncateForContext(text: string, maxTokens: number): string {
  // Rough approximation: 1 token ≈ 4 characters for English
  const maxChars = maxTokens * 4;
  return truncateText(text, maxChars);
}