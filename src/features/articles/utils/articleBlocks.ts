export function normalizeBlockItems(items: unknown): string[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.reduce<string[]>((normalizedItems, item) => {
    if (typeof item === 'string') {
      const normalizedItem = item.trim();

      return normalizedItem
        ? [...normalizedItems, normalizedItem]
        : normalizedItems;
    }

    if (!item || typeof item !== 'object') {
      return normalizedItems;
    }

    const candidate = item as {
      label?: unknown;
      text?: unknown;
      title?: unknown;
      value?: unknown;
      body?: unknown;
      name?: unknown;
    };

    const preferredValue = [
      candidate.label,
      candidate.text,
      candidate.title,
      candidate.value,
      candidate.body,
      candidate.name,
    ].find(value => typeof value === 'string' && value.trim().length > 0);

    return typeof preferredValue === 'string'
      ? [...normalizedItems, preferredValue.trim()]
      : normalizedItems;
  }, []);
}

export function getArticleContentParagraphs(content: string, summary: string) {
  const normalizedContent = content
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);

  if (normalizedContent.length > 0) {
    return normalizedContent;
  }

  return summary ? [summary] : [];
}
