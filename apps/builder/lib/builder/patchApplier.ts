/**
 * Very simple HTML patch applier – replaces a target section's innerHTML with new content.
 * For a full HTML diff you would use a proper diff library, but here we only need
 * surgical updates for sections like hero, products, about, contact.
 */
export function applyPatch(html: string, sectionId: string, newSectionHtml: string): string {
  const regex = new RegExp(`(<section[^>]*id=["']${sectionId}["'][^>]*>)([\s\S]*?)(</section>)`, 'i');
  if (!regex.test(html)) {
    console.warn(`Section ${sectionId} not found – returning original HTML`);
    return html;
  }
  return html.replace(regex, `$1\n${newSectionHtml}\n$3`);
}

/**
 * If the builder agent returns a full HTML document (most common case), we just replace the whole thing.
 * This function is a fallback when a targeted patch cannot be applied.
 */
export function replaceFullHtml(_oldHtml: string, newHtml: string): string {
  return newHtml;
}