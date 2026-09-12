import React, { useState } from 'react';
import {
  FileText,
  User,
  AlignLeft,
  Layers,
  Sparkles,
  GraduationCap,
  Lightbulb,
  PlusCircle,
  FolderKanban,
  Check,
} from 'lucide-react';
import { PaperData } from '../types';
import { STUDENT_TEMPLATES } from '../data/defaultPaper';

interface BasicDetailsCardProps {
  paperData: PaperData;
  onChange: (updates: Partial<PaperData>) => void;
  onApplyTemplate?: (templateKey: string) => void;
  selectedTemplateKey?: string;
  onOpenChatAdvisor?: () => void;
}

export const BasicDetailsCard: React.FC<BasicDetailsCardProps> = ({
  paperData,
  onChange,
  onApplyTemplate,
  selectedTemplateKey = 'blank',
  onOpenChatAdvisor,
}) => {
  const [showWritingTips, setShowWritingTips] = useState(false);

  // Helper writing starters for students
  const abstractStarters = [
    'This paper introduces an empirical architecture designed to...',
    'In this study, we evaluate the computational performance and scalability of...',
    'We present a modular framework addressing current bottlenecks in...',
  ];

  const handleAppendStarter = (starter: string) => {
    const current = paperData.abstract.trim();
    if (!current) {
      onChange({ abstract: starter });
    } else {
      onChange({ abstract: `${current} ${starter}` });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-slate-900 uppercase">
              Project Basic Details
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">Card 1 • Core IEEE Metadata & Abstract</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 rounded-full">
          Step 1 of 3
        </span>
      </div>

      {/* Student Template Quick-Select Bar */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <FolderKanban className="w-3.5 h-3.5 text-amber-600" />
            <span>Course Track / Quick Starter Template</span>
          </label>
          <span className="text-[10px] text-slate-500 font-medium">1-Click Presets for Students</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {Object.entries(STUDENT_TEMPLATES).map(([key, template]) => {
            const isSelected = selectedTemplateKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onApplyTemplate && onApplyTemplate(key)}
                className={`p-2 rounded-lg text-left text-xs font-medium transition border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                }`}
              >
                <span className="font-semibold text-[11px] leading-tight line-clamp-1">{template.label}</span>
                <span className={`text-[9px] mt-1 ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                  {isSelected ? '✓ Active' : 'Load preset'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Project Title */}
        <div>
          <label className="block text-slate-800 font-semibold mb-1.5 flex items-center justify-between">
            <span>Project Title</span>
            <span className="text-[10px] text-slate-500 font-normal">Formats as IEEE bold headline</span>
          </label>
          <input
            type="text"
            value={paperData.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g., An Empirical Investigation of Scalable Network Protocols"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3.5 py-2.5 text-slate-900 text-xs placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none transition shadow-2xs font-medium"
          />
        </div>

        {/* Author / Developer Name & Affiliation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-800 font-semibold mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Student / Author Name</span>
            </label>
            <input
              type="text"
              value={paperData.author}
              onChange={(e) => onChange({ author: e.target.value })}
              placeholder="e.g., Student Name or Research Team"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3.5 py-2.5 text-slate-900 text-xs placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-1.5 flex items-center justify-between">
              <span>Student ID & Department</span>
              <span className="text-[10px] text-slate-500 font-normal">Academic Info</span>
            </label>
            <input
              type="text"
              value={paperData.studentId}
              onChange={(e) => onChange({ studentId: e.target.value })}
              placeholder="e.g., Roll / Reg No. • Department"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3.5 py-2.5 text-slate-900 text-xs placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none transition shadow-2xs"
            />
          </div>
        </div>

        {/* College / Affiliation & Conference Tag */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-800 font-semibold mb-1.5">
              University / Institute Affiliation
            </label>
            <input
              type="text"
              value={paperData.affiliation}
              onChange={(e) => onChange({ affiliation: e.target.value })}
              placeholder="e.g., Department of Computer Science & Engineering, University Name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3.5 py-2 text-slate-900 text-xs placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-1.5">
              Publication / Course Banner
            </label>
            <input
              type="text"
              value={paperData.publicationTag}
              onChange={(e) => onChange({ publicationTag: e.target.value })}
              placeholder="e.g., IEEE Student Conference / Capstone Documentation"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3.5 py-2 text-slate-900 text-xs placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none transition shadow-2xs"
            />
          </div>
        </div>

        {/* Abstract / Problem Statement with Student Assistant */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-slate-800 font-semibold flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-amber-600" />
              <span>Abstract / Problem Statement</span>
            </label>
            <div className="flex items-center gap-2">
              {onOpenChatAdvisor && (
                <button
                  type="button"
                  onClick={onOpenChatAdvisor}
                  className="text-[11px] text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 transition shadow-2xs"
                  title="Ask Gemini Academic Advisor to critique or rewrite abstract"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Ask AI Advisor</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowWritingTips(!showWritingTips)}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 transition"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>{showWritingTips ? 'Hide Starters' : '💡 Writing Starters'}</span>
              </button>
            </div>
          </div>

          {/* Expandable Writing Starters for Students */}
          {showWritingTips && (
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2 animate-in fade-in duration-150">
              <p className="text-[11px] font-semibold text-amber-900">
                Click a starter phrase to insert it into your abstract:
              </p>
              <div className="space-y-1">
                {abstractStarters.map((starter, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAppendStarter(starter)}
                    className="w-full text-left text-[11px] text-amber-950 bg-white/80 hover:bg-white p-2 rounded-lg border border-amber-200/80 transition flex items-center justify-between group shadow-2xs"
                  >
                    <span className="italic leading-snug">"{starter}"</span>
                    <PlusCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            rows={4}
            value={paperData.abstract}
            onChange={(e) => onChange({ abstract: e.target.value })}
            placeholder="Provide a concise summary: define the research problem, proposed solution or system design, and key empirical results..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3.5 py-2.5 text-slate-900 text-xs placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none transition resize-y leading-relaxed font-sans shadow-2xs"
          />
        </div>

        {/* Key Modules / Tech Stack */}
        <div>
          <label className="block text-slate-800 font-semibold mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Key Modules & Architecture Subsystems</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">Section I Subsystems</span>
          </label>
          <textarea
            rows={3}
            value={paperData.keyModules}
            onChange={(e) => onChange({ keyModules: e.target.value })}
            placeholder="Cryptographic Nonce Engine (Rust, SHA-256)\nPeer-to-Peer Transport (Libp2p, GossipSub)\nConsensus State Coordinator (PBFT Hybrid)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3.5 py-2 text-slate-900 text-xs placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none transition resize-y font-mono text-[11px] leading-relaxed shadow-2xs"
          />
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Tip: Enter one module per line. They will format as individual IEEE architectural sub-sections.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
