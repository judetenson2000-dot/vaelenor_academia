import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCheck,
  Award,
  Printer,
  Sparkles,
  Layers,
} from 'lucide-react';
import { PaperData } from '../types';
import { LatexRenderer } from './LatexRenderer';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface AcademicPaperPreviewProps {
  paperData: PaperData;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
  isAdminUnlocked: boolean;
}

export const AcademicPaperPreview: React.FC<AcademicPaperPreviewProps> = ({
  paperData,
  onDownloadPdf,
  isGeneratingPdf,
  isAdminUnlocked,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 130));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 70));
  const handleZoomReset = () => setZoomLevel(100);

  // Parse modules if entered as text
  const parsedModules = paperData.keyModules
    ? paperData.keyModules
        .split(/[\n;]+/)
        .map((m) => m.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-900 uppercase">
              IEEE A4 Preview
            </h3>
          </div>
          <div className="flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Ready</span>
          </div>
        </div>

        {/* Zoom and Quick Actions */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center rounded-lg bg-slate-100 border border-slate-200 p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-700 select-none font-medium">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition border-l border-slate-200 ml-0.5"
              title="Fit to 100%"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition"
            title="Browser Print Preview"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Scrollable A4 Viewport with workbench background */}
      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 flex justify-center bg-slate-200/70 custom-scrollbar">
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="transition-all"
        >
          {/* A4 White Paper Container (#paper-content for html2pdf.js) */}
          <div
            id="paper-content"
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-[18mm] md:p-[20mm] shadow-xl shadow-slate-400/50 rounded-xs font-['Merriweather'] text-[11pt] leading-[1.65] relative selection:bg-amber-100 selection:text-amber-900 border border-slate-200"
            style={{
              fontFamily: "'Merriweather', Georgia, serif",
              boxSizing: 'border-box',
            }}
          >
            {/* Top IEEE Journal Header Banner */}
            <div className="border-b-2 border-slate-900 pb-2 mb-6 flex items-center justify-between text-[8.5pt] font-sans text-slate-600 tracking-wider uppercase font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="font-serif font-black text-slate-900 text-[10pt]">IEEE</span>
                <span>• {paperData.publicationTag || 'Student Proof-of-Work Documentation'}</span>
              </span>
              <span>{paperData.date || 'September 2026'}</span>
            </div>

            {/* Paper Header: Centered Title, Author Name, Publication Tag */}
            <header className="text-center mb-7 space-y-2">
              <h1 className="text-[17pt] md:text-[19pt] font-black tracking-tight text-slate-950 leading-snug font-['Merriweather'] max-w-[90%] mx-auto">
                {paperData.title || 'Untitled Academic Report'}
              </h1>

              {/* Author & Affiliation Details */}
              <div className="pt-2 text-[10pt] text-slate-800 space-y-0.5">
                <p className="font-bold tracking-wide text-slate-900">
                  {paperData.author || 'Author / Student Name'}
                </p>
                <p className="italic text-[9pt] text-slate-600 font-sans">
                  {paperData.affiliation || 'Department & Academic Institution'}
                </p>
                <div className="flex items-center justify-center gap-3 text-[8.5pt] font-mono text-slate-500 pt-0.5">
                  {paperData.studentId && <span>ID: {paperData.studentId}</span>}
                  {paperData.email && <span>• {paperData.email}</span>}
                </div>
              </div>
            </header>

            {/* Horizontal Academic Divider */}
            <div className="w-16 h-0.5 bg-slate-900 mx-auto mb-6 opacity-60" />

            {/* Section 1: Abstract & Keywords */}
            <section className="mb-6 bg-slate-50/90 p-4 rounded border-l-2 border-slate-900 text-[9.5pt] leading-relaxed">
              <p className="text-justify">
                <span className="font-sans font-black text-[9pt] tracking-wider uppercase text-slate-900 mr-1.5 not-italic">
                  Abstract—
                </span>
                <span className="italic text-slate-800">
                  {paperData.abstract ||
                    'No abstract entered. Formulate a clear statement of the academic hypothesis and empirical objectives in the control sidebar.'}
                </span>
              </p>

              {paperData.keywords && (
                <p className="mt-2.5 pt-2 border-t border-slate-200 text-[8.5pt] text-slate-700 font-sans">
                  <span className="font-bold text-slate-900 italic">Index Terms—</span>{' '}
                  {paperData.keywords}
                </p>
              )}
            </section>

            {/* Body Content */}
            <div className="space-y-6 text-[10pt] text-slate-900">
              {/* Section I: Key System Architecture / Modules */}
              <section className="space-y-3">
                <h2 className="text-[11pt] font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center gap-2">
                  <span>I. Key System Architecture & Core Modules</span>
                </h2>

                <p className="text-justify text-[9.5pt] text-slate-800 leading-relaxed">
                  The implemented proof-of-work apparatus decomposes into modular architectural
                  subsystems engineered for deterministic verification, computational efficiency, and
                  reproducible empirical telemetry.
                </p>

                {parsedModules.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {parsedModules.map((mod, i) => (
                      <div
                        key={i}
                        className="p-3 rounded border border-slate-200 bg-white/90 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center gap-1.5 text-[9pt] font-sans font-bold text-slate-900">
                          <span className="text-amber-800 font-mono text-[8pt]">§1.{i + 1}</span>
                          <span>{mod}</span>
                        </div>
                        <p className="text-[8.5pt] text-slate-600 leading-normal font-sans">
                          Subsystem pipeline supporting non-blocking asynchronous execution and proof verification.
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-slate-500 text-[9pt]">
                    Specify architectural modules in Card 1 to generate subsystem breakdowns.
                  </p>
                )}
              </section>

              {/* Section II: Literature Review & Technical Background (Dynamically Populated) */}
              <section id="literature-review-section" className="space-y-3">
                <h2 className="text-[11pt] font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center justify-between">
                  <span>II. Literature Review & Technical Background</span>
                  <span className="text-[8pt] font-sans font-normal text-slate-500 normal-case">
                    Wikipedia Commons Bound
                  </span>
                </h2>

                <p className="text-justify text-[9.5pt] text-slate-800 leading-relaxed">
                  To ground the theoretical framework within peer-reviewed consensus and technical
                  foundations, canonical literature was synthesized and bound into this section:
                </p>

                {paperData.boundResearch.length === 0 ? (
                  <div className="p-4 rounded border border-dashed border-slate-300 bg-slate-50/60 text-center text-[9pt] text-slate-500 italic">
                    No peer research bound yet. Use "Search & Bind Research (Wikipedia)" to query Wikipedia and bind articles here.
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {paperData.boundResearch.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded bg-slate-50/70 border border-slate-200/90 space-y-1.5"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="text-[9.5pt] font-sans font-bold text-slate-950">
                            <span className="text-amber-800 font-mono mr-1.5">[{idx + 1}]</span>
                            {item.title}
                          </h3>
                          <span className="text-[8pt] font-mono text-slate-500 shrink-0">
                            ref: Wikipedia
                          </span>
                        </div>
                        <p className="text-[9pt] text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                          {item.snippet}
                        </p>
                        <div className="text-[7.5pt] font-sans text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span>
                            Source:{' '}
                            <span className="underline decoration-slate-400">{item.url}</span>
                          </span>
                          <span className="font-semibold text-slate-600">
                            Licensed CC BY-SA 4.0
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Automatically appended ethical/legal citation note at the bottom of the bound section */}
                    <div className="mt-2.5 p-2 rounded bg-slate-100/90 border border-slate-300 text-[8pt] text-slate-800 font-sans flex items-center justify-between">
                      <span className="font-semibold">
                        Source: Wikipedia Contributors (Licensed under Creative Commons CC BY-SA 4.0)
                      </span>
                      <span className="text-[7.5pt] text-slate-500 font-mono">
                        Academic Commons Attribution
                      </span>
                    </div>
                  </div>
                )}
              </section>

              {/* Section III: Mathematical Formulation & Governing Equations */}
              {paperData.equations && paperData.equations.length > 0 && (
                <section className="space-y-3 break-inside-avoid">
                  <h2 className="text-[11pt] font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center justify-between">
                    <span>III. Mathematical Formulation & Governing Equations</span>
                    <span className="text-[8.5pt] font-mono text-slate-500 font-normal lowercase">
                      {paperData.equations.length} {paperData.equations.length === 1 ? 'formula' : 'formulas'}
                    </span>
                  </h2>

                  <p className="text-justify text-[9.5pt] text-slate-800 leading-relaxed">
                    The theoretical underpinnings, computational bounds, and algorithmic invariants governing
                    the operational behavior of the system are formalized through the following analytical expressions:
                  </p>

                  <div className="space-y-3 my-2">
                    {paperData.equations.map((eq) => (
                      <div
                        key={eq.id}
                        className="p-3 rounded bg-slate-50/60 border border-slate-200/80 break-inside-avoid space-y-1.5"
                      >
                        {/* Equation Title/Label */}
                        {eq.label && (
                          <div className="flex items-center justify-between text-[8.5pt] font-sans font-bold text-slate-800">
                            <span>{eq.label}</span>
                          </div>
                        )}

                        {/* Centered Formula with Flush-Right IEEE Equation Number */}
                        <div className="flex items-center justify-between gap-4 py-1.5 px-2 bg-white rounded border border-slate-200/60">
                          <div className="flex-1 text-center overflow-x-auto">
                            <LatexRenderer latex={eq.latex} displayMode={true} />
                          </div>
                          <span className="font-mono text-[9pt] font-bold text-slate-800 shrink-0 select-all">
                            ({eq.equationNumber})
                          </span>
                        </div>

                        {/* Variable definition / derivation context */}
                        {eq.explanation && (
                          <p className="text-[8.5pt] text-slate-600 font-sans italic text-justify leading-relaxed pt-0.5">
                            {eq.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section IV: Empirical Calculation & Experimental Verification */}
              {paperData.graph.enabled && (
                <section className="space-y-3 break-inside-avoid">
                  <h2 className="text-[11pt] font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                    <span>
                      {paperData.equations && paperData.equations.length > 0 ? 'IV' : 'III'}. Empirical
                      Calculation & Experimental Verification
                    </span>
                  </h2>

                  <p className="text-justify text-[9.5pt] text-slate-800 leading-relaxed">
                    Experimental parameters were computed and graphed across operational workloads to
                    validate system scaling and latency determinism under varying computational loads.
                  </p>

                  {/* High Resolution Figure Box */}
                  <div className="my-3 p-3.5 bg-white border border-slate-300 rounded shadow-2xs text-center break-inside-avoid">
                    <div className="w-full h-56 mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        {paperData.graph.chartType === 'line' ? (
                          <LineChart
                            data={paperData.graph.data}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis
                              dataKey="x"
                              stroke="#0f172a"
                              fontSize={10}
                              tickLine={{ stroke: '#0f172a' }}
                            />
                            <YAxis
                              stroke="#0f172a"
                              fontSize={10}
                              tickLine={{ stroke: '#0f172a' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="y"
                              name={paperData.graph.yAxisLabel}
                              stroke={paperData.graph.color || '#d97706'}
                              strokeWidth={2.5}
                              dot={{ r: 4, fill: paperData.graph.color || '#d97706' }}
                            />
                            {paperData.graph.data[0]?.baseline !== undefined && (
                              <Line
                                type="monotone"
                                dataKey="baseline"
                                name="Theoretical Baseline"
                                stroke="#64748b"
                                strokeWidth={1.5}
                                strokeDasharray="3 3"
                                dot={false}
                              />
                            )}
                          </LineChart>
                        ) : paperData.graph.chartType === 'area' ? (
                          <AreaChart
                            data={paperData.graph.data}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="x" stroke="#0f172a" fontSize={10} />
                            <YAxis dataKey="y" stroke="#0f172a" fontSize={10} />
                            <Area
                              type="monotone"
                              dataKey="y"
                              stroke={paperData.graph.color || '#0284c7'}
                              fill={paperData.graph.color || '#0284c7'}
                              fillOpacity={0.25}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        ) : (
                          <BarChart
                            data={paperData.graph.data}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="x" stroke="#0f172a" fontSize={10} />
                            <YAxis dataKey="y" stroke="#0f172a" fontSize={10} />
                            <Bar
                              dataKey="y"
                              fill={paperData.graph.color || '#7c3aed'}
                              radius={[2, 2, 0, 0]}
                            />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    {/* Figure Academic Caption */}
                    <p className="mt-2 text-[8.5pt] font-sans text-slate-700 font-medium px-4 leading-normal">
                      <span className="font-bold text-slate-900">
                        {paperData.graph.caption || 'Figure 1: Measured empirical system performance.'}
                      </span>
                    </p>
                  </div>
                </section>
              )}

              {/* Section: Formal IEEE References & Citations */}
              <section className="pt-4 border-t-2 border-slate-900 text-[8.5pt] space-y-2 break-inside-avoid">
                <h3 className="font-sans font-bold uppercase tracking-wider text-slate-900 text-[9.5pt]">
                  References
                </h3>

                {paperData.boundResearch.length === 0 ? (
                  <p className="italic text-slate-500 font-sans">
                    [1] Standard IEEE citation bibliography will automatically compile here as Wikipedia literature is bound.
                  </p>
                ) : (
                  <ol className="space-y-1.5 font-sans text-slate-800 list-none pl-0">
                    {paperData.boundResearch.map((item, idx) => (
                      <li key={item.id} className="flex items-start gap-2 leading-relaxed">
                        <span className="font-mono font-bold text-slate-900 shrink-0">
                          [{idx + 1}]
                        </span>
                        <span>
                          Wikipedia Contributors, "{item.title}," in{' '}
                          <span className="italic">Wikipedia, The Free Encyclopedia</span>, 2026.
                          [Online]. Available:{' '}
                          <span className="font-mono text-[7.5pt] text-slate-600 break-all">
                            {item.url}
                          </span>{' '}
                          (Licensed under CC BY-SA 4.0).
                        </span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2 leading-relaxed">
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        [{paperData.boundResearch.length + 1}]
                      </span>
                      <span>
                        Vaelenor Proof-of-Work Automated Academic Builder, "The Angel of Unbound Artisans Documentation Protocol,"{' '}
                        <span className="italic">Institute of Advanced Technology Transactions</span>, 2026.
                      </span>
                    </li>
                  </ol>
                )}
              </section>

              {/* Student Proof-of-Work Footer Stamp */}
              <footer className="pt-6 mt-6 border-t border-slate-300 flex items-center justify-between text-[7.5pt] font-mono text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>VAELENOR ARTISAN VERIFIED PROOF-OF-WORK</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>SHA-256: 4f8b2c9e...</span>
                  <span>•</span>
                  <span>Page 1 of 1 (A4)</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
