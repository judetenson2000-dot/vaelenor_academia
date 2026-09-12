import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Shield, RotateCcw, GraduationCap, Cloud, Globe, FileText, Loader2, CheckCircle2, Save } from 'lucide-react';
import { useFirebase } from '../lib/FirebaseContext';

interface TopNavProps {
  onOpenAdmin: () => void;
  isAdminUnlocked: boolean;
  onResetToSample: () => void;
  completionScore?: number;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  onOpenCloudVault?: () => void;
  currentView?: 'workspace' | 'wiki-research';
  onSelectView?: (view: 'workspace' | 'wiki-research') => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenAdmin,
  isAdminUnlocked,
  onResetToSample,
  completionScore = 100,
  onToggleChat,
  isChatOpen = false,
  onOpenCloudVault,
  currentView = 'workspace',
  onSelectView,
}) => {
  const { user, isFirebaseConnected } = useFirebase();
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const handleLogoClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    const nextCount = clickCount + 1;

    if (nextCount >= 5) {
      setClickCount(0);
      onOpenAdmin();
      return;
    }

    setClickCount(nextCount);

    // Reset after 3 seconds of inactivity
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 3000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 lg:px-8 py-3 transition shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Logo with refined crest, text VAELENOR, and tagline */}
        <div
          id="vaelenor-logo-trigger"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          title="Vaelenor Academic Documentation Architecture"
          className="group flex items-center gap-3 cursor-pointer select-none rounded-xl p-1 -ml-1 transition-all hover:bg-slate-50/80 active:scale-98 shrink-0"
        >
          {/* Refined Premium Monogram Crest */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-amber-400 border border-amber-500/30 shadow-md shadow-slate-900/10 transition-transform group-hover:scale-105">
            {/* Geometric Vector Accent */}
            <svg
              className="w-5 h-5 text-amber-400/90 drop-shadow-xs"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span className="absolute text-[11px] font-serif font-black text-amber-300 pointer-events-none drop-shadow-xs">
              V
            </span>
          </div>

          {/* Text "VAELENOR" and tagline */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="tracking-[0.2em] text-base lg:text-lg font-black text-slate-900 font-serif group-hover:text-amber-800 transition-colors">
                VAELENOR
              </span>
              <span className="rounded-full px-2 py-0.5 text-[8.5px] font-extrabold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/90 font-mono">
                IEEE Protocol
              </span>
            </div>
            <span className="text-[10px] font-medium tracking-wide text-slate-500 font-sans">
              Academic Synthesis & Proof-of-Work
            </span>
          </div>
        </div>

        {/* Center: View Switcher (Document Workspace vs Dedicated Wikipedia Research Page) */}
        {onSelectView && (
          <nav className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onSelectView('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentView === 'workspace'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Full Paper Editor</span>
            </button>
            <button
              onClick={() => onSelectView('wiki-research')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentView === 'wiki-research'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${currentView === 'wiki-research' ? 'text-white' : 'text-sky-600'}`} />
              <span>Search & Bind Research (Wikipedia)</span>
            </button>
          </nav>
        )}

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2.5">
          {/* AI Thesis Advisor Button */}
          {onToggleChat && (
            <button
              onClick={onToggleChat}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                isChatOpen
                  ? 'bg-amber-600 text-white shadow-amber-600/20'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 hover:border-amber-300'
              }`}
              title="Open Gemini Academic Advisor"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isChatOpen ? 'text-white animate-spin' : 'text-amber-600'}`} />
              <span className="hidden sm:inline">AI Thesis Advisor</span>
              <span className="sm:hidden">Advisor</span>
            </button>
          )}

          {/* Firebase Cloud Vault Button */}
          {onOpenCloudVault && (
            <button
              onClick={onOpenCloudVault}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs ${
                user
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-900 hover:bg-amber-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title="Firebase Cloud Paper Vault (vaelenor-5f619)"
            >
              <Cloud className={`w-3.5 h-3.5 ${user ? 'text-amber-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">
                {user ? (user.displayName?.split(' ')[0] || 'My Vault') : 'Cloud Vault'}
              </span>
              <span className="sm:hidden">Vault</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isFirebaseConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={isFirebaseConnected ? 'Firebase connected' : 'Firebase offline'}
              />
            </button>
          )}

          {/* Secret Admin Portal Access - STRICTLY SECRET: Only visible when unlocked! */}
          {isAdminUnlocked && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 transition shadow-xs"
              title="Open Admin Control Portal"
            >
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin Portal</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}

          {/* Student Progress Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Readiness: <strong className="text-slate-900 font-bold">{completionScore}%</strong></span>
          </div>

          <button
            onClick={onResetToSample}
            title="Reset to sample paper template"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition shadow-2xs hover:text-slate-900"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
