import React, { useState } from 'react';
import { Search, Globe, Plus, Trash2, ExternalLink, BookOpen, Loader2, Check, BookmarkCheck, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { BoundResearch } from '../types';
import { searchWikipedia, fetchWikiExtractByTitle, fetchWikiSummary, WikiSearchResult } from '../utils/wikiApi';

interface WikipediaSearchCardProps {
  boundResearch: BoundResearch[];
  onBindResearch: (item: BoundResearch) => void;
  onUnbindResearch: (id: string) => void;
  onOpenDedicatedPage?: () => void;
}

export const WikipediaSearchCard: React.FC<WikipediaSearchCardProps> = ({
  boundResearch,
  onBindResearch,
  onUnbindResearch,
  onOpenDedicatedPage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WikiSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [justBoundId, setJustBoundId] = useState<number | null>(null);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const query = overrideQuery !== undefined ? overrideQuery : searchQuery;
    if (!query.trim()) return;

    setIsSearching(true);
    setErrorMessage('');
    try {
      const results = await searchWikipedia(query.trim());
      setSearchResults(results);
      if (results.length === 0) {
        setErrorMessage('No Wikipedia articles found matching this query.');
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Could not connect to Wikipedia API. Please verify your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBind = async (result: WikiSearchResult) => {
    // Check if already bound
    const alreadyBound = boundResearch.some(
      (b) => b.pageId === result.pageid || b.title.toLowerCase() === result.title.toLowerCase()
    );
    if (alreadyBound) return;

    // Fetch fuller summary extract
    let fullText = result.fullSummary;
    if (!fullText || fullText.length < 150) {
      try {
        const direct = await fetchWikiExtractByTitle(result.title);
        fullText = direct.extract || fullText;
      } catch {
        const summary = await fetchWikiSummary(result.title);
        fullText = summary.extract || result.snippet;
      }
    }

    const newBoundItem: BoundResearch = {
      id: `wiki_${result.pageid || Date.now()}`,
      title: result.title,
      snippet: fullText || result.snippet,
      url: result.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/\s+/g, '_'))}`,
      pageId: result.pageid,
      addedAt: new Date().toISOString(),
      citationKey: `[${boundResearch.length + 1}]`,
    };

    onBindResearch(newBoundItem);
    setJustBoundId(result.pageid);
    setTimeout(() => setJustBoundId(null), 2500);

    // Smoothly scroll the A4 preview to the Literature Review section
    setTimeout(() => {
      const sectionEl = document.getElementById('literature-review-section');
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 150);
  };

  const studentTopicPresets = [
    'Byzantine fault',
    'Proof of work',
    'Convolutional neural network',
    'Gradient descent',
    'LoRa',
    'Zero-knowledge proof',
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-slate-900 uppercase">
              Search & Bind Research (Wikipedia)
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">Card 2 • IEEE Literature Review & Citations</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenDedicatedPage && (
            <button
              type="button"
              onClick={onOpenDedicatedPage}
              className="text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
              title="Open full dedicated Wikipedia research studio"
            >
              <span>Full Page</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[11px] font-semibold text-sky-800 bg-sky-100/70 border border-sky-300 px-2.5 py-0.5 rounded-full">
            Step 2 of 3
          </span>
        </div>
      </div>

      {/* Search Input & Button */}
      <form onSubmit={(e) => handleSearch(e)} className="space-y-2.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search peer literature (e.g. Byzantine fault, Neural network, LoRa...)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white pl-10 pr-3.5 py-2.5 text-slate-900 text-xs placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none transition shadow-2xs"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Search</span>
          </button>
        </div>

        {/* Quick Suggestion Chips for Students */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] text-slate-500 font-medium">Suggested topics:</span>
          {studentTopicPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setSearchQuery(preset);
                handleSearch(undefined, preset);
              }}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md transition font-medium"
            >
              {preset}
            </button>
          ))}
        </div>
      </form>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Search Result Box */}
      {searchResults.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
            <span>Search Results ({searchResults.length})</span>
            <span className="text-[10px] text-slate-500 font-normal">Direct from Wikipedia Knowledge Commons</span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {searchResults.map((result) => {
              const isAlreadyBound = boundResearch.some(
                (b) => b.pageId === result.pageid || b.title.toLowerCase() === result.title.toLowerCase()
              );
              const isJustBound = justBoundId === result.pageid;

              return (
                <div
                  key={result.pageid}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <h4 className="text-xs font-bold text-slate-900">
                        {result.title}
                      </h4>
                    </div>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Open in Wikipedia"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Summary snippet */}
                  <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed text-justify">
                    {result.snippet}
                  </p>

                  {/* Prominent "➕ Bind To Academic Report" Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={isAlreadyBound}
                      onClick={() => handleBind(result)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs ${
                        isAlreadyBound
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                          : 'bg-sky-600 hover:bg-sky-700 text-white'
                      }`}
                    >
                      {isAlreadyBound || isJustBound ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                          <span>Bound in Academic Report [Section II]</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>➕ Bind To Academic Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bound Research Items List */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Bound Literature & Citations ({boundResearch.length})</span>
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Auto-formatted in Section II & References</span>
        </div>

        {boundResearch.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
            No research bound yet. Search Wikipedia and click "➕ Bind To Academic Report" to add peer-reviewed citations into Section II.
          </p>
        ) : (
          <div className="space-y-2">
            {boundResearch.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                      [{index + 1}]
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {item.snippet}
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    CC BY-SA 4.0 Open License Attribution
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onUnbindResearch(item.id)}
                  title="Remove citation from report"
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Ethical citation note */}
            <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/90 text-amber-950 text-[11px] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  Source: Wikipedia Contributors (Licensed under Creative Commons CC BY-SA 4.0)
                </p>
                <p className="text-[10px] text-amber-800/80">
                  Automatically formatted into IEEE Section II and References bibliography.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

