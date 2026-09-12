export interface WikiSearchResult {
  pageid: number;
  title: string;
  snippet: string;
  fullSummary?: string;
  wordcount: number;
  timestamp: string;
  url: string;
}

/**
 * Queries the free Wikipedia API using the exact endpoint:
 * https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=...&format=json&origin=*
 * Returns the article's title, introductory plain-text extract summary, pageid, and Wikipedia URL.
 */
export async function fetchWikiExtractByTitle(
  title: string
): Promise<{ title: string; extract: string; pageid: number; url: string }> {
  if (!title.trim()) {
    throw new Error('Please enter an article title to search.');
  }

  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(
    title.trim()
  )}&format=json&origin=*`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Wikipedia API query failed with status ${res.status}`);
  }

  const data = await res.json();
  const pages = data.query?.pages || {};
  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];

  if (!page || page.missing !== undefined || pageId === '-1') {
    throw new Error(`Article "${title}" was not found on Wikipedia.`);
  }

  const cleanTitle = page.title || title;
  const extract = page.extract || '';

  return {
    title: cleanTitle,
    extract: extract,
    pageid: page.pageid || (parseInt(pageId, 10) > 0 ? parseInt(pageId, 10) : Date.now()),
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTitle.replace(/\s+/g, '_'))}`,
  };
}

/**
 * Searches Wikipedia using free API and retrieves previews and full extracts for each match.
 * Combines generator=search with prop=extracts&exintro&explaintext or fallback to title extracts.
 */
export async function searchWikipedia(query: string): Promise<WikiSearchResult[]> {
  if (!query.trim()) return [];

  const trimmed = query.trim();

  try {
    // 1. First try fetching matching articles with introductory plain-text extracts
    const generatorEndpoint = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      trimmed
    )}&gsrlimit=6&prop=extracts&exintro&explaintext&format=json&origin=*`;

    const res = await fetch(generatorEndpoint);
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages;

      if (pages && Object.keys(pages).length > 0) {
        return Object.values(pages)
          .filter((p: any) => p && p.pageid > 0 && p.title)
          .map((p: any) => {
            const rawExtract = p.extract || '';
            const snippet = rawExtract.length > 280 ? `${rawExtract.slice(0, 280)}...` : rawExtract;
            return {
              pageid: p.pageid,
              title: p.title,
              snippet: snippet || `Academic literature overview for ${p.title}`,
              fullSummary: rawExtract,
              wordcount: rawExtract ? rawExtract.split(/\s+/).length : 120,
              timestamp: new Date().toISOString(),
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/\s+/g, '_'))}`,
            };
          });
      }
    }
  } catch (err) {
    console.warn('Generator search fallback:', err);
  }

  // 2. Direct exact title lookup using the user's specific prop=extracts&exintro&explaintext endpoint
  try {
    const directResult = await fetchWikiExtractByTitle(trimmed);
    const rawExtract = directResult.extract;
    const snippet = rawExtract.length > 280 ? `${rawExtract.slice(0, 280)}...` : rawExtract;
    return [
      {
        pageid: directResult.pageid,
        title: directResult.title,
        snippet: snippet || `Academic literature overview for ${directResult.title}`,
        fullSummary: rawExtract,
        wordcount: rawExtract ? rawExtract.split(/\s+/).length : 120,
        timestamp: new Date().toISOString(),
        url: directResult.url,
      },
    ];
  } catch {
    // 3. Fallback to standard search list
    const fallbackEndpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      trimmed
    )}&utf8=&format=json&origin=*&srlimit=6`;
    const res = await fetch(fallbackEndpoint);
    if (!res.ok) throw new Error(`Wikipedia query failed with status ${res.status}`);
    const data = await res.json();
    const search = data.query?.search || [];

    return search.map((item: any) => {
      const cleanSnippet = item.snippet ? item.snippet.replace(/<\/?[^>]+(>|$)/g, '') : '';
      return {
        pageid: item.pageid,
        title: item.title,
        snippet: cleanSnippet,
        fullSummary: cleanSnippet,
        wordcount: item.wordcount,
        timestamp: item.timestamp,
        url: `https://en.wikipedia.org/?curid=${item.pageid}`,
      };
    });
  }
}

export async function fetchWikiSummary(title: string): Promise<{ extract: string; url: string }> {
  try {
    const direct = await fetchWikiExtractByTitle(title);
    if (direct.extract) {
      return {
        extract: direct.extract,
        url: direct.url,
      };
    }
  } catch {
    // ignore and fallback
  }

  try {
    const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Summary fetch failed');
    const data = await res.json();
    return {
      extract: data.extract || data.description || '',
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch {
    return {
      extract: '',
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  }
}
