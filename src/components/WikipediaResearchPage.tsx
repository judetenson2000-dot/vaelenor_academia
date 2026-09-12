import React, { useState } from 'react';
import {
  Search,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  BookOpen,
  Loader2,
  Check,
  BookmarkCheck,
  ArrowLeft,
  Sparkles,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { BoundResearch, PaperData } from '../types';
import {
  searchWikipedia,
  fetchWikiExtractByTitle,
  fetchWikiSummary,
  WikiSearchResult,
} from '../utils/wikiApi';
import { AcademicPaperPreview } from './AcademicPaperPreview';

interface WikipediaResearchPageProps {
  paperData: PaperData;
  boundResearch?: BoundResearch[];
  onBindResearch: (item: BoundResearch) => void;
  onUnbindResearch: (id: string) => void;
  onBackToEditor: () => void;
  onDownloadPdf: () => void;
  isGeneratingPdf?: boolean;
  isAdminUnlocked?: boolean;
}

export const WikipediaResearchPage: React.FC<WikipediaResearchPageProps> = ({
  paperData,
  onBindResearch,
  onUnbindResearch,
  onBackToEditor,
  onDownloadPdf,
  isGeneratingPdf = false,
  isAdminUnlocked = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WikiSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [justBoundId, setJustBoundId] = useState<number | null>(null);
  const [expandedSummaryId, setExpandedSummaryId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mobileTab, setMobileTab] = useState<'search' | 'preview'>('search');

  const academicCategories = [
    {
      id: 'distributed',
      name: 'Distributed Systems',
      topics: ['Byzantine fault', 'Proof of work', 'Paxos (computer science)', 'Consensus (computer science)'],
    },
    {
      id: 'ai',
      name: 'AI & Deep Learning',
      topics: ['Convolutional neural network', 'Transformer (deep learning architecture)', 'Gradient descent', 'Backpropagation'],
    },
    {
      id: 'security',
      name: 'Security & Crypto',
      topics: ['Zero-knowledge proof', 'Public-key cryptography', 'Diffie–Hellman key exchange', 'SHA-2'],
    },
    {
      id: 'systems',
      name: 'Networks & IoT',
      topics: ['LoRa', 'Software-defined networking', 'Edge computing', 'Microservices'],
    },
  ];

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
        setErrorMessage(`No Wikipedia articles found matching "${query.trim()}". Try an alternate academic keyword.`);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Could not query Wikipedia API. Please verify your network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBind = async (result: WikiSearchResult) => {
    // Check if already bound
    const alreadyBound = paperData.boundResearch.some(
      (b) => b.pageId === result.pageid || b.title.toLowerCase() === result.title.toLowerCase()
    );
    if (alreadyBound) return;

    // Fetch fuller summary extract if not already cached
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
      citationKey: `[${paperData.boundResearch.length + 1}]`,
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

  const scrollToLiteratureReview = () => {
    const sectionEl = document.getElementById('literature-review-section');
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Banner Navigation */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToEditor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Full Editor</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Search & Bind Research (Wikipedia)
                </h1>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Query Wikipedia Commons • Inject into Section II Literature Review • Automatic CC BY-SA 4.0 Citations
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollToLiteratureReview}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition"
              title="Jump to Section II on A4 Preview"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>Section II in A4: {paperData.boundResearch.length} Bound</span>
            </button>

            <button
              onClick={onDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Download Academic PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-2 flex items-center justify-center gap-2">
        <button
          onClick={() => setMobileTab('search')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
            mobileTab === 'search'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search & Articles</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
            mobileTab === 'preview'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Live A4 Preview (#paper-content)</span>
        </button>
      </div>

      {/* Two-Column Studio Layout */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Side: Wikipedia Discovery Engine */}
        <section
          className={`lg:col-span-6 xl:col-span-6 flex flex-col space-y-5 ${
            mobileTab === 'search' ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* Main Search Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                  Free Wikipedia Open API
                </span>
                <h2 className="text-sm font-bold text-slate-900 pt-1">
                  Query Peer Literature & Academic Concepts
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                prop=extracts&exintro
              </span>
            </div>

            {/* Search Input & Action Button */}
            <form onSubmit={(e) => handleSearch(e)} className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter academic topic (e.g. Proof of work, Byzantine fault, Neural network)..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white pl-10 pr-3.5 py-2.5 text-slate-900 text-xs placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none transition shadow-2xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Search API</span>
                </button>
              </div>

              {/* Student-Friendly Domain Topic Chips */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Student Recommended Domains:</span>
                  <span className="text-[10px] text-slate-400">Click to search instantly</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {academicCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium ${
                        activeCategory === cat.id
                          ? 'bg-sky-100 text-sky-900 border-sky-300 font-semibold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {(activeCategory === 'all'
                    ? academicCategories.flatMap((c) => c.topics)
                    : academicCategories.find((c) => c.id === activeCategory)?.topics || []
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSearchQuery(preset);
                        handleSearch(undefined, preset);
                      }}
                      className="text-[11px] bg-slate-100/80 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-200 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md transition font-medium"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Search Results Display Area */}
          {searchResults.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Search Results ({searchResults.length})
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Preview snippet & bind to Section II
                </span>
              </div>

              <div className="space-y-3">
                {searchResults.map((result) => {
                  const isAlreadyBound = paperData.boundResearch.some(
                    (b) => b.pageId === result.pageid || b.title.toLowerCase() === result.title.toLowerCase()
                  );
                  const isJustBound = justBoundId === result.pageid;
                  const isExpanded = expandedSummaryId === result.pageid;

                  return (
                    <div
                      key={result.pageid}
                      className={`p-4 rounded-xl border transition space-y-2.5 ${
                        isAlreadyBound
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold shrink-0">
                            W
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {result.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-500">
                            ~{result.wordcount} words
                          </span>
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-600 p-1"
                            title="Inspect original article on Wikipedia"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Preview Snippet */}
                      <p className="text-xs text-slate-700 leading-relaxed text-justify">
                        {isExpanded && result.fullSummary ? result.fullSummary : result.snippet}
                      </p>

                      {/* Expand / Collapse Full Summary Button */}
                      {result.fullSummary && result.fullSummary.length > result.snippet.length && (
                        <button
                          type="button"
                          onClick={() => setExpandedSummaryId(isExpanded ? null : result.pageid)}
                          className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              <span>Show less</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <span>Read full summary extract</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}

                      {/* Prominent "➕ Bind To Academic Report" Button */}
                      <div className="pt-1">
                        <button
                          type="button"
                          disabled={isAlreadyBound}
                          onClick={() => handleBind(result)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs ${
                            isAlreadyBound
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                              : 'bg-sky-600 hover:bg-sky-700 text-white hover:shadow-sky-600/20 active:scale-[0.99]'
                          }`}
                        >
                          {isAlreadyBound || isJustBound ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                              <span>✓ Bound in Section II Literature Review</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 stroke-[2.5]" />
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

          {/* Bound Research Items Manager */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900">
                  Bound Articles in Literature Review ({paperData.boundResearch.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Rendered live in #paper-content
              </span>
            </div>

            {paperData.boundResearch.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
                <p className="text-xs text-slate-600 font-medium">
                  No Wikipedia research bound yet.
                </p>
                <p className="text-[11px] text-slate-500">
                  Search above and click <span className="font-bold text-slate-700">"➕ Bind To Academic Report"</span> to inject canonical summaries into Section II.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {paperData.boundResearch.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded shrink-0">
                          [{index + 1}]
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => onUnbindResearch(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Remove from Literature Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {item.snippet}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 font-sans">
                      <span className="truncate max-w-[70%]">
                        Source: {item.url}
                      </span>
                      <span className="font-semibold text-slate-600">
                        CC BY-SA 4.0
                      </span>
                    </div>
                  </div>
                ))}

                {/* Ethical / Legal Citation Note Callout */}
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Ethical Attribution Guarantee</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Source: Wikipedia Contributors (Licensed under Creative Commons CC BY-SA 4.0).
                  </p>
                  <p className="text-[10px] text-amber-800/80">
                    This note is dynamically compiled into Section II and References in your live IEEE A4 report.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Live A4 Academic Paper Preview (#paper-content) */}
        <section
          className={`lg:col-span-6 xl:col-span-6 flex flex-col space-y-3 ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:flex'
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">
                Live A4 Document (#paper-content)
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Section II dynamically updates with bound literature
            </span>
          </div>

          <div className="flex-1 overflow-auto rounded-2xl">
            <AcademicPaperPreview
              paperData={paperData}
              onDownloadPdf={onDownloadPdf}
              isGeneratingPdf={isGeneratingPdf}
              isAdminUnlocked={isAdminUnlocked}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
