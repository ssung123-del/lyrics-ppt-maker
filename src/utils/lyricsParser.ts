/**
 * Separates the raw lyrics text into logical slide chunks.
 * We split by double newlines to allow users to group lines per slide naturally.
 * This separation of concerns ensures our parsing logic is isolated and testable.
 */
export function parseLyricsToSlides(rawText: string): string[] {
  if (!rawText.trim()) return [];
  
  // Split by two or more newlines to create slide chunks
  return rawText
    .split(/\n\s*\n/)
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 0);
}
