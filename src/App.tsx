import React, { useState, useMemo, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { BasicDetailsCard } from './components/BasicDetailsCard';
import { WikipediaSearchCard } from './components/WikipediaSearchCard';
import { LatexEquationCard } from './components/LatexEquationCard';
import { GraphEngineCard } from './components/GraphEngineCard';
import { AcademicPaperPreview } from './components/AcademicPaperPreview';
import { WikipediaResearchPage } from './components/WikipediaResearchPage';
import { AdminModal } from './components/AdminModal';
import { CloudPapersModal } from './components/CloudPapersModal';
import { GeminiAdvisorChat } from './components/GeminiAdvisorChat';
import { DeveloperCoffeeSection } from './components/DeveloperCoffeeSection';
import { PaperData, BoundResearch, GraphCalculation, PaymentConfig, AcademicEquation } from './types';
import { INITIAL_PAPER_DATA, STUDENT_TEMPLATES } from './data/defaultPaper';
import { exportPaperToPdf } from './utils/pdfExport';
import { Download, Loader2, Check, Sparkles, FileText, Eye, CheckCircle2, Circle, Bot, Globe } from 'lucide-react';

export default function App() {
  // 1. Initialize paperData from localStorage if an auto-saved draft exists
  const [paperData, setPaperData] = useState<PaperData>(() => {
    try {
      const saved = localStorage.getItem('vaelenor_autosave_paper_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.title !== undefined) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read autosaved draft from localStorage:', err);
    }
    return INITIAL_PAPER_DATA;
  });

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('blank');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessNotice, setPdfSuccessNotice] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Active View: 'workspace' (Full document editor) | 'wiki-research' (Separate Wikipedia Research Page)
  const [currentView, setCurrentView] = useState<'workspace' | 'wiki-research'>('workspace');

  // Mobile view tab toggle: 'editor' | 'preview'
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Dynamic Payment & QR Config shared between Admin and Footer
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  // Secret Admin Access via Key Combination (Ctrl+Shift+A / Cmd+Shift+A) and URL Hash (#admin / #secret-admin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminModalOpen(true);
      }
    };

    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.hash === '#secret-admin') {
        setIsAdminModalOpen(true);
      }
    };

    if (window.location.hash === '#admin' || window.location.hash === '#secret-admin') {
      setIsAdminModalOpen(true);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Auto-save paperData to localStorage every 10 seconds
  useEffect(() => {
    const saveToLocalStorage = () => {
      try {
        localStorage.setItem('vaelenor_autosave_paper_data', JSON.stringify(paperData));
        localStorage.setItem('vaelenor_autosave_timestamp', new Date().toISOString());
      } catch (err) {
        console.error('Error auto-saving paperData to localStorage:', err);
      }
    };

    const intervalId = setInterval(saveToLocalStorage, 10000);

    return () => clearInterval(intervalId);
  }, [paperData]);

  // Compute student checklist & readiness
  const checklist = useMemo(() => {
    return [
      { id: 'meta', label: 'Title & Author', ready: !!(paperData.title.trim() && paperData.author.trim()) },
      { id: 'abstract', label: 'Abstract & Scope', ready: paperData.abstract.trim().length >= 40 },
      { id: 'modules', label: 'Architecture Subsystems', ready: paperData.keyModules.trim().length >= 20 },
      { id: 'research', label: `Literature (${paperData.boundResearch.length} bound)`, ready: paperData.boundResearch.length > 0 },
      { id: 'equations', label: `Equations (${(paperData.equations || []).length} bound)`, ready: (paperData.equations || []).length > 0 },
      { id: 'graph', label: 'Empirical Figure', ready: paperData.graph.enabled && paperData.graph.data.length > 0 },
    ];
  }, [paperData]);

  const completionScore = useMemo(() => {
    const readyCount = checklist.filter((item) => item.ready).length;
    return Math.round((readyCount / checklist.length) * 100);
  }, [checklist]);

  const handleUpdatePaperData = (updates: Partial<PaperData>) => {
    setPaperData((prev) => ({ ...prev, ...updates }));
  };

  const handleApplyTemplate = (templateKey: string) => {
    const template = STUDENT_TEMPLATES[templateKey];
    if (template) {
      setSelectedTemplateKey(templateKey);
      setPaperData(template.data);
    }
  };

  const handleBindResearch = (item: BoundResearch) => {
    setPaperData((prev) => ({
      ...prev,
      boundResearch: [...prev.boundResearch, item],
    }));
  };

  const handleUnbindResearch = (id: string) => {
    setPaperData((prev) => ({
      ...prev,
      boundResearch: prev.boundResearch.filter((b) => b.id !== id),
    }));
  };

  const handleUpdateEquations = (equations: AcademicEquation[]) => {
    setPaperData((prev) => ({
      ...prev,
      equations,
    }));
  };

  const handleUpdateGraph = (updates: Partial<GraphCalculation>) => {
    setPaperData((prev) => ({
      ...prev,
      graph: { ...prev.graph, ...updates },
    }));
  };

  const handleResetToSample = () => {
    setSelectedTemplateKey('blank');
    setPaperData(INITIAL_PAPER_DATA);
    try {
      localStorage.setItem('vaelenor_autosave_paper_data', JSON.stringify(INITIAL_PAPER_DATA));
      localStorage.setItem('vaelenor_autosave_timestamp', new Date().toISOString());
    } catch {}
  };

  const handleDownloadAcademicPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfError(null);

      const filename = `${(paperData.title || 'Vaelenor_Report')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40)}_IEEE.pdf`;

      await exportPaperToPdf({
        elementId: 'paper-content',
        filename,
        onSuccess: () => {
          setIsGeneratingPdf(false);
          setPdfSuccessNotice(true);
          setTimeout(() => setPdfSuccessNotice(false), 4000);
        },
        onError: (err) => {
          setIsGeneratingPdf(false);
          setPdfError(err.message || 'Failed to generate PDF. Please try again.');
        },
      });
    } catch (err: any) {
      setIsGeneratingPdf(false);
      setPdfError(err.message || 'Failed to generate PDF.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* 1. TOP NAVIGATION HEADER */}
      <TopNav
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        isAdminUnlocked={isAdminUnlocked}
        onResetToSample={handleResetToSample}
        completionScore={completionScore}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        onOpenCloudVault={() => setIsCloudModalOpen(true)}
        currentView={currentView}
        onSelectView={setCurrentView}
      />

      {/* VIEW CONDITIONAL: DEDICATED WIKIPEDIA RESEARCH PAGE */}
      {currentView === 'wiki-research' ? (
        <WikipediaResearchPage
          boundResearch={paperData.boundResearch}
          paperData={paperData}
          onBindResearch={handleBindResearch}
          onUnbindResearch={handleUnbindResearch}
          onBackToEditor={() => setCurrentView('workspace')}
          onDownloadPdf={handleDownloadAcademicPdf}
          isGeneratingPdf={isGeneratingPdf}
          isAdminUnlocked={isAdminUnlocked}
        />
      ) : (
        <>
          {/* Student Checklist Progress Bar (Subtle & Helpful) */}
          <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xs px-4 lg:px-8 py-2">
            <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Student Document Checklist:
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-1 text-[11px] font-medium transition ${
                      item.ready ? 'text-emerald-800' : 'text-slate-500'
                    }`}
                  >
                    {item.ready ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-600">{completionScore}% Complete</span>
              </div>
            </div>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-2 flex items-center justify-center gap-2">
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                mobileTab === 'editor'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Editor & Input Cards</span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                mobileTab === 'preview'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live IEEE A4 Preview</span>
            </button>
          </div>

          {/* Main Two-Column App Workspace */}
          <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            {/* 2. LEFT SIDEBAR (INPUT & CONTROL PANEL) */}
            <section
              className={`lg:col-span-5 flex flex-col space-y-5 ${
                mobileTab === 'editor' ? 'block' : 'hidden lg:flex'
              }`}
            >
              {/* Card 1: Project Basic Details */}
              <BasicDetailsCard
                paperData={paperData}
                onChange={handleUpdatePaperData}
                onApplyTemplate={handleApplyTemplate}
                selectedTemplateKey={selectedTemplateKey}
                onOpenChatAdvisor={() => setIsChatOpen(true)}
              />

              {/* Card 2: Search & Bind Research (Wikipedia Integration) */}
              <WikipediaSearchCard
                boundResearch={paperData.boundResearch}
                onBindResearch={handleBindResearch}
                onUnbindResearch={handleUnbindResearch}
                onOpenDedicatedPage={() => setCurrentView('wiki-research')}
              />

              {/* Card 3: LaTeX Equation Tool & Mathematical Formulations */}
              <LatexEquationCard
                equations={paperData.equations || []}
                onChange={handleUpdateEquations}
              />

              {/* Card 4: Academic Graph & Calculation Engine */}
              <GraphEngineCard
                graph={paperData.graph}
                onChange={handleUpdateGraph}
              />

              {/* Primary Action Button: Full-width "📥 Download Academic PDF" CTA button using html2pdf.js */}
              <div className="sticky bottom-4 z-30 pt-2 pb-1 bg-gradient-to-t from-slate-100 via-slate-100/95 to-transparent">
                <button
                  id="download-academic-pdf-btn"
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={handleDownloadAcademicPdf}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-black text-sm tracking-wide shadow-lg shadow-amber-600/25 active:scale-[0.99] transition flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:pointer-events-none group"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Compiling High-Resolution IEEE PDF...</span>
                    </>
                  ) : pdfSuccessNotice ? (
                    <>
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                      <span>IEEE Report Successfully Exported!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                      <span>📥 Download Academic PDF</span>
                    </>
                  )}
                </button>

                {pdfError && (
                  <p className="text-xs text-rose-800 mt-2 text-center bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {pdfError}
                  </p>
                )}
              </div>
            </section>

            {/* 3. RIGHT SIDEBAR (LIVE A4 ACADEMIC PREVIEW) */}
            <section
              className={`lg:col-span-7 flex flex-col h-[calc(100vh-125px)] sticky top-24 ${
                mobileTab === 'preview' ? 'block h-[85vh]' : 'hidden lg:flex'
              }`}
            >
              <AcademicPaperPreview
                paperData={paperData}
                onDownloadPdf={handleDownloadAcademicPdf}
                isGeneratingPdf={isGeneratingPdf}
                isAdminUnlocked={isAdminUnlocked}
              />
            </section>
          </main>
        </>
      )}

      {/* Buy Developer a Coffee & QR Code Area (Placed quietly below main workspace so it never intercepts student work) */}
      <DeveloperCoffeeSection
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        liveConfig={paymentConfig}
      />

      {/* Secret Admin Console Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        paperData={paperData}
        onUpdatePaperData={handleUpdatePaperData}
        isAdminUnlocked={isAdminUnlocked}
        onSetAdminUnlocked={setIsAdminUnlocked}
        onPaymentConfigUpdated={(newCfg) => setPaymentConfig(newCfg)}
      />

      {/* Firebase Cloud Papers Vault Modal */}
      <CloudPapersModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        currentPaper={paperData}
        onLoadPaper={handleUpdatePaperData}
      />

      {/* Floating Student AI Advisor Trigger Button */}
      {!isChatOpen && (
        <button
          id="open-gemini-advisor-btn"
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs shadow-xl shadow-amber-600/30 hover:scale-105 active:scale-95 transition-all group border border-amber-400/40 cursor-pointer"
          title="Open Gemini Academic Advisor"
        >
          <div className="relative">
            <Bot className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </div>
          <span className="tracking-wide">Ask AI Thesis Advisor</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/25 text-[10px] font-extrabold uppercase tracking-wider text-amber-50">
            Free
          </span>
        </button>
      )}

      {/* Gemini Academic Advisor Chat Drawer */}
      <GeminiAdvisorChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        paperData={paperData}
        onApplyAbstract={(newAbstract) => handleUpdatePaperData({ abstract: newAbstract })}
        onApplyTitle={(newTitle) => handleUpdatePaperData({ title: newTitle })}
        onAppendModules={(newMod) =>
          handleUpdatePaperData({
            keyModules: paperData.keyModules ? `${paperData.keyModules}\n${newMod}` : newMod,
          })
        }
      />
    </div>
  );
}
