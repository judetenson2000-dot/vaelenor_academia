import React, { useState, useRef } from 'react';
import {
  Sigma,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  HelpCircle,
  Hash,
  ArrowUp,
  ArrowDown,
  Calculator,
} from 'lucide-react';
import { AcademicEquation } from '../types';
import { LatexRenderer } from './LatexRenderer';

interface LatexEquationCardProps {
  equations: AcademicEquation[];
  onChange: (equations: AcademicEquation[]) => void;
}

// Academic Presets for instant insertion
const EQUATION_PRESETS: {
  category: string;
  name: string;
  latex: string;
  label: string;
  explanation: string;
}[] = [
  {
    category: 'Computer Science & Security',
    name: 'PoW Target Hash Condition',
    label: 'Proof-of-Work Target Hash Inequality',
    latex: '\\mathcal{H}(B_{n} \\parallel \\text{nonce}) \\le T',
    explanation:
      'Where \\mathcal{H} denotes the cryptographic double SHA-256 hash function, B_{n} represents the candidate block header, and T is the dynamically computed 256-bit target threshold.',
  },
  {
    category: 'Computer Science & Security',
    name: 'Byzantine Fault Tolerance Quorum',
    label: 'Byzantine Fault Tolerance Quorum Inequality',
    latex: 'N \\ge 3f + 1',
    explanation:
      'Where N denotes the total participating validator nodes and f represents the maximum tolerable count of concurrently faulty or malicious Byzantine actors.',
  },
  {
    category: 'Computer Science & Security',
    name: 'Mining Difficulty Target',
    label: 'Cryptographic Mining Difficulty Ratio',
    latex: 'D = \\frac{T_{\\max}}{T}',
    explanation:
      'Where D is network difficulty and T_{\\max} denotes maximum allowable target threshold.',
  },
  {
    category: 'AI & Machine Learning',
    name: 'Cross-Entropy Loss',
    label: 'Categorical Cross-Entropy Loss',
    latex: '\\mathcal{L}_{\\text{CE}} = -\\frac{1}{N}\\sum_{i=1}^{N}\\sum_{c=1}^{C} y_{i,c} \\ln(\\hat{y}_{i,c})',
    explanation:
      'Where N denotes batch size, C is class cardinality, y_{i,c} is the binary ground-truth label, and \\hat{y}_{i,c} is predicted softmax probability.',
  },
  {
    category: 'AI & Machine Learning',
    name: 'Softmax Activation',
    label: 'Multinomial Softmax Activation Function',
    latex: '\\sigma(\\mathbf{z})_i = \\frac{e^{z_i}}{\\sum_{j=1}^{K} e^{z_j}}',
    explanation:
      'Where \\mathbf{z} is the logit vector and K denotes the dimension of the output probability simplex.',
  },
  {
    category: 'AI & Machine Learning',
    name: 'Gradient Descent Optimization',
    label: 'Stochastic Gradient Descent Parameter Update',
    latex: '\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\nabla_{\\mathbf{w}} \\mathcal{L}(\\mathbf{w}_t)',
    explanation:
      'Where \\mathbf{w}_t represents network weight parameters and \\eta denotes the scheduled learning rate.',
  },
  {
    category: 'Statistics & Math',
    name: "Bayes' Theorem",
    label: "Bayes' Posterior Probability Theorem",
    latex: 'P(A \\mid B) = \\frac{P(B \\mid A) \\, P(A)}{P(B)}',
    explanation:
      'Where P(A|B) denotes posterior probability, P(B|A) is likelihood, and P(A) is prior probability.',
  },
  {
    category: 'Statistics & Math',
    name: 'Shannon Information Entropy',
    label: 'Shannon Discrete Information Entropy',
    latex: 'H(X) = -\\sum_{i=1}^{n} P(x_i) \\log_2 P(x_i)',
    explanation:
      'Where H(X) measures expected uncertainty or information content across discrete outcome states.',
  },
  {
    category: 'Statistics & Math',
    name: 'Gaussian Normal Distribution',
    label: 'Univariate Gaussian Probability Density Function',
    latex: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\exp\\left( -\\frac{(x-\\mu)^2}{2\\sigma^2} \\right)',
    explanation:
      'Where \\mu represents mean distribution center and \\sigma denotes standard deviation.',
  },
  {
    category: 'IoT & Telemetry',
    name: 'Free-Space Path Loss',
    label: 'Radio Free-Space Path Loss (FSPL)',
    latex: '\\text{FSPL} = 20\\log_{10}(d) + 20\\log_{10}(f) - 147.55',
    explanation:
      'Where d is propagation distance in meters and f denotes radio carrier frequency in Hertz.',
  },
];

// Quick Symbol Insertion Palette
const SYMBOL_CATEGORIES = [
  {
    name: 'Fractions & Roots',
    items: [
      { label: 'a/b', insert: '\\frac{a}{b}' },
      { label: '√x', insert: '\\sqrt{x}' },
      { label: 'ⁿ√x', insert: '\\sqrt[n]{x}' },
      { label: '∂y/∂x', insert: '\\frac{\\partial y}{\\partial x}' },
    ],
  },
  {
    name: 'Powers & Scripts',
    items: [
      { label: 'x²', insert: 'x^{2}' },
      { label: 'xᵢ', insert: 'x_{i}' },
      { label: 'xᵢⁿ', insert: 'x_{i}^{n}' },
      { label: 'e⁻ˣ', insert: 'e^{-x}' },
      { label: 'x̂', insert: '\\hat{x}' },
      { label: 'x̄', insert: '\\bar{x}' },
      { label: 'v⃗', insert: '\\vec{v}' },
      { label: 'X', insert: '\\mathbf{X}' },
    ],
  },
  {
    name: 'Calculus & Series',
    items: [
      { label: '∑', insert: '\\sum_{i=1}^{n} ' },
      { label: '∏', insert: '\\prod_{i=1}^{n} ' },
      { label: '∫', insert: '\\int_{a}^{b} f(x)\\,dx' },
      { label: 'lim', insert: '\\lim_{x \\to \\infty} ' },
      { label: '∇', insert: '\\nabla ' },
      { label: '∂', insert: '\\partial ' },
      { label: 'Δ', insert: '\\Delta ' },
      { label: 'log₂', insert: '\\log_{2}(x)' },
      { label: 'ln', insert: '\\ln(x)' },
    ],
  },
  {
    name: 'Greek Letters',
    items: [
      { label: 'α', insert: '\\alpha ' },
      { label: 'β', insert: '\\beta ' },
      { label: 'γ', insert: '\\gamma ' },
      { label: 'δ', insert: '\\delta ' },
      { label: 'ε', insert: '\\epsilon ' },
      { label: 'θ', insert: '\\theta ' },
      { label: 'λ', insert: '\\lambda ' },
      { label: 'μ', insert: '\\mu ' },
      { label: 'π', insert: '\\pi ' },
      { label: 'σ', insert: '\\sigma ' },
      { label: 'τ', insert: '\\tau ' },
      { label: 'φ', insert: '\\phi ' },
      { label: 'ω', insert: '\\omega ' },
      { label: 'Ω', insert: '\\Omega ' },
      { label: 'Σ', insert: '\\Sigma ' },
    ],
  },
  {
    name: 'Operators & Relations',
    items: [
      { label: '≤', insert: '\\le ' },
      { label: '≥', insert: '\\ge ' },
      { label: '≠', insert: '\\neq ' },
      { label: '≈', insert: '\\approx ' },
      { label: '≡', insert: '\\equiv ' },
      { label: '±', insert: '\\pm ' },
      { label: '×', insert: '\\times ' },
      { label: '·', insert: '\\cdot ' },
      { label: '→', insert: '\\to ' },
      { label: '⇒', insert: '\\implies ' },
      { label: '∈', insert: '\\in ' },
      { label: '∉', insert: '\\notin ' },
      { label: '⊂', insert: '\\subset ' },
    ],
  },
  {
    name: 'Brackets & Matrices',
    items: [
      { label: '(...)', insert: '\\left( x \\right)' },
      { label: '[...]', insert: '\\left[ x \\right]' },
      { label: '{...}', insert: '\\left\\{ x \\right\\}' },
      { label: '|x|', insert: '\\left| x \\right|' },
      {
        label: '[Matrix 2x2]',
        insert: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
      },
      {
        label: '(Vector 2x1)',
        insert: '\\begin{pmatrix} x_1 \\\\ x_2 \\end{pmatrix}',
      },
    ],
  },
];

export const LatexEquationCard: React.FC<LatexEquationCardProps> = ({
  equations = [],
  onChange,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEquationId, setEditingEquationId] = useState<string | null>(null);

  // Form states
  const [label, setLabel] = useState('');
  const [latexInput, setLatexInput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [activePaletteCategory, setActivePaletteCategory] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Insert symbol snippet at current cursor location
  const handleInsertSymbol = (snippet: string) => {
    if (!textareaRef.current) {
      setLatexInput((prev) => prev + snippet);
      return;
    }

    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const textBefore = latexInput.substring(0, startPos);
    const textAfter = latexInput.substring(endPos);

    const newText = textBefore + snippet + textAfter;
    setLatexInput(newText);

    // Reposition cursor right after inserted snippet
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursor = startPos + snippet.length;
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 10);
  };

  const handleOpenNew = () => {
    setEditingEquationId(null);
    setLabel(`Governing Equation ${equations.length + 1}`);
    setLatexInput('\\mathcal{H}(x) \\le T');
    setExplanation('');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (eq: AcademicEquation) => {
    setEditingEquationId(eq.id);
    setLabel(eq.label);
    setLatexInput(eq.latex);
    setExplanation(eq.explanation || '');
    setIsEditorOpen(true);
  };

  const handleApplyPreset = (preset: typeof EQUATION_PRESETS[0]) => {
    setLabel(preset.label);
    setLatexInput(preset.latex);
    setExplanation(preset.explanation);
    setShowPresets(false);
  };

  const handleSaveEquation = () => {
    if (!latexInput.trim()) return;

    if (editingEquationId) {
      // Update existing
      const updated = equations.map((eq) =>
        eq.id === editingEquationId
          ? {
              ...eq,
              label: label.trim() || `Equation ${eq.equationNumber}`,
              latex: latexInput.trim(),
              explanation: explanation.trim(),
            }
          : eq
      );
      onChange(updated);
    } else {
      // Create new
      const nextNum = equations.length + 1;
      const newEq: AcademicEquation = {
        id: `eq_${Date.now()}`,
        equationNumber: nextNum,
        label: label.trim() || `Equation ${nextNum}`,
        latex: latexInput.trim(),
        explanation: explanation.trim(),
      };
      onChange([...equations, newEq]);
    }

    setIsEditorOpen(false);
    setEditingEquationId(null);
  };

  const handleDeleteEquation = (id: string) => {
    const remaining = equations.filter((e) => e.id !== id);
    // Renumber sequentially in standard IEEE order
    const renumbered = remaining.map((e, index) => ({
      ...e,
      equationNumber: index + 1,
    }));
    onChange(renumbered);
  };

  const handleMoveEquation = (index: number, direction: 'up' | 'down') => {
    const newEquations = [...equations];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newEquations.length) return;

    const temp = newEquations[index];
    newEquations[index] = newEquations[targetIndex];
    newEquations[targetIndex] = temp;

    // Renumber
    const renumbered = newEquations.map((e, idx) => ({
      ...e,
      equationNumber: idx + 1,
    }));

    onChange(renumbered);
  };

  const handleCopyLatex = (latex: string, id: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20">
            <Sigma className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                LaTeX Equation Tool
              </h2>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                IEEE Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Add mathematical models, proofs, and numbered equations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Equation</span>
        </button>
      </div>

      {/* Equation List */}
      <div className="space-y-3">
        {equations.length === 0 ? (
          <div className="p-5 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <Calculator className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">
              No mathematical equations added yet
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Use the LaTeX tool to insert formulas with official IEEE numbering (1), (2) into Section III.
            </p>
            <button
              type="button"
              onClick={handleOpenNew}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>Create First Equation</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {equations.map((eq, idx) => (
              <div
                key={eq.id}
                className="group relative p-3 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50/70 hover:bg-white transition shadow-2xs space-y-2"
              >
                {/* Equation Top Bar */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 text-amber-900 font-mono font-bold text-[10px]">
                      ({eq.equationNumber})
                    </span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                      {eq.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Move Up/Down */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveEquation(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded"
                      title="Move equation up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === equations.length - 1}
                      onClick={() => handleMoveEquation(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded"
                      title="Move equation down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy LaTeX code */}
                    <button
                      type="button"
                      onClick={() => handleCopyLatex(eq.latex, eq.id)}
                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded transition"
                      title="Copy raw LaTeX formula"
                    >
                      {copiedId === eq.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(eq)}
                      className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded transition"
                      title="Edit LaTeX Equation"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteEquation(eq.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      title="Delete equation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* KaTeX Live Rendered Preview Box */}
                <div className="bg-white p-3 rounded-lg border border-slate-200/90 shadow-2xs flex items-center justify-center overflow-x-auto text-center min-h-[44px]">
                  <LatexRenderer latex={eq.latex} displayMode={true} />
                </div>

                {/* Optional explanation snippet */}
                {eq.explanation && (
                  <p className="text-[11px] text-slate-500 italic font-serif line-clamp-2 pt-0.5">
                    {eq.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Editor & Formatter Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-5 custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white font-mono font-bold text-xs">
                  ∑
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {editingEquationId ? 'Edit LaTeX Equation' : 'Add Academic Equation'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPresets((prev) => !prev)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Presets Library</span>
                  {showPresets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Presets Dropdown Drawer */}
            {showPresets && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    One-Click Academic Formulas
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Click to load into editor
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {EQUATION_PRESETS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xs transition text-left space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                          {preset.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {preset.category.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 truncate bg-slate-50 px-1.5 py-0.5 rounded">
                        {preset.latex}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Equation Name/Label Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Equation Title / Formal Notation</span>
                <span className="text-[11px] font-normal text-slate-500">
                  (e.g., Target Hash Condition)
                </span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Proof-of-Work Target Hash Inequality"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition"
              />
            </div>

            {/* Interactive Math Symbol Insertion Toolbar */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  LaTeX Symbol & Structure Palette
                </span>
                <span className="text-[11px] text-slate-500">
                  Click to insert at cursor
                </span>
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
                {SYMBOL_CATEGORIES.map((cat, catIdx) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setActivePaletteCategory(catIdx)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                      activePaletteCategory === catIdx
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Symbol Buttons for Active Category */}
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-28 overflow-y-auto custom-scrollbar">
                {SYMBOL_CATEGORIES[activePaletteCategory].items.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertSymbol(item.insert)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-slate-800 text-xs font-mono font-medium shadow-2xs transition hover:scale-105 active:scale-95"
                    title={`Insert ${item.insert}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LaTeX Raw Source Code Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>LaTeX Equation Syntax</span>
                <span className="text-[11px] font-mono text-slate-400">
                  math mode syntax (omits $$)
                </span>
              </label>
              <textarea
                ref={textareaRef}
                rows={3}
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                placeholder="\mathcal{H}(B_n \parallel \text{nonce}) \le T"
                className="w-full p-3 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 selection:bg-amber-600 selection:text-white"
              />
            </div>

            {/* Live Real-time KaTeX Formatted Preview */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-amber-600" />
                <span>Live Publication Preview (as it will appear in IEEE A4)</span>
              </span>
              <div className="p-4 rounded-xl bg-white border-2 border-slate-200/90 shadow-inner flex items-center justify-center min-h-[70px] overflow-x-auto relative">
                {latexInput.trim() ? (
                  <div className="w-full flex items-center justify-between px-3">
                    <div className="flex-1 text-center">
                      <LatexRenderer latex={latexInput} displayMode={true} />
                    </div>
                    <span className="font-mono text-xs text-slate-500 font-bold ml-4 shrink-0">
                      ({editingEquationId ? equations.find(e => e.id === editingEquationId)?.equationNumber || '1' : equations.length + 1})
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Type a LaTeX formula above or click a preset to preview
                  </span>
                )}
              </div>
            </div>

            {/* Mathematical Derivation / Notation Context Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Variable Definitions & Mathematical Derivation (Optional)</span>
                <span className="text-[11px] font-normal text-slate-500">
                  displayed below equation
                </span>
              </label>
              <textarea
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Where H denotes the double SHA-256 hash function and T represents the 256-bit difficulty threshold..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none transition"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!latexInput.trim()}
                onClick={handleSaveEquation}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingEquationId ? 'Save Changes' : 'Insert into Paper'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
