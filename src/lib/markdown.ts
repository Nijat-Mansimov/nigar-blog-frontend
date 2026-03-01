/**
 * Converts markdown syntax to HTML
 * Handles: headings, bold, italic, links, images, lists, code blocks
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // Handle code blocks first to avoid processing their content
  const codeBlocks: string[] = [];
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const escapedCode = code.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    codeBlocks.push(
      `<pre style="background-color: #f5f5f5; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.5rem 0;"><code style="font-family: 'Monaco', 'Courier New', monospace; font-size: 0.9rem;">${escapedCode}</code></pre>`
    );
    return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
  });

  // Handle inline code
  html = html.replace(/`([^`]+)`/g, "<code style='background-color: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.9em;'>$1</code>");

  // Handle splits for proper paragraph/list handling
  const blocks = html.split(/\n(?=\n)/);
  let processedBlocks: string[] = [];

  for (let block of blocks) {
    block = block.trim();
    if (!block) continue;

    // Check if it's a list block
    if (/^[\-\*]\s|^\d+\.\s/.test(block)) {
      // Process list items
      let listItems = block.split(/\n/).map(line => line.trim()).filter(l => l);
      let listHtml = '';
      let isOrdered = /^\d+\./.test(listItems[0]);
      let listTag = isOrdered ? 'ol' : 'ul';
      
      listHtml = `<${listTag} style="margin: 1rem 0 1rem 1.5rem; line-height: 1.8;">`;
      for (let item of listItems) {
        const cleanItem = item.replace(/^[\-\*\d+.]\s+/, '');
        listHtml += `<li>${cleanItem}</li>`;
      }
      listHtml += `</${listTag}>`;
      processedBlocks.push(listHtml);
    } else {
      processedBlocks.push(block);
    }
  }

  html = processedBlocks.join('\n\n');

  // Handle images (must be before links to avoid conflicts)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    return `<figure style="margin: 2rem 0; text-align: center;"><img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" /><figcaption style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">${alt}</figcaption></figure>`;
  });

  // Handle links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #1a73e8; text-decoration: none; border-bottom: 1px solid #1a73e8;">$1</a>');

  // Handle headings with proper spacing
  html = html.replace(/^### (.*?)$/gm, "<h3 style='font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; line-height: 1.3;'>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2 style='font-size: 1.875rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.3;'>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1 style='font-size: 2.25rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem; line-height: 1.2;'>$1</h1>");

  // Handle bold and italic (bold first, then italic)
  html = html.replace(/\*\*\*([^\*]+)\*\*\*/g, "<strong style='font-weight: 700;'><em>$1</em></strong>");
  html = html.replace(/\*\*([^\*]+)\*\*/g, "<strong style='font-weight: 700;'>$1</strong>");
  html = html.replace(/\*([^\*]+)\*/g, "<em style='font-style: italic;'>$1</em>");
  html = html.replace(/__([^_]+)__/g, "<strong style='font-weight: 700;'>$1</strong>");
  html = html.replace(/_([^_]+)_/g, "<em style='font-style: italic;'>$1</em>");

  // Wrap remaining text in paragraphs
  const lines = html.split(/\n\n+/);
  html = lines.map(line => {
    line = line.trim();
    if (!line) return '';
    if (/<h[1-3]|<ul|<ol|<pre|<figure|^___CODE_BLOCK/.test(line)) return line;
    return `<p style="margin-bottom: 1.25rem; line-height: 1.8; font-size: 1.0625rem;">${line}</p>`;
  }).join('');

  // Restore code blocks
  for (let i = 0; i < codeBlocks.length; i++) {
    html = html.replace(`___CODE_BLOCK_${i}___`, codeBlocks[i]);
  }

  return html;
}
