import React, { useState } from 'react';
import {
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Download,
  Image as ImageIcon,
  FileDown,
  Paperclip,
  Check,
  Calculator,
  RefreshCw,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
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
  Tooltip,
} from 'recharts';
import { GraphCalculation } from '../types';
import {
  PRESET_CALCULATIONS,
  parseValuesInput,
  evaluateFormulaCommand,
} from '../utils/calcEngine';
import { exportChartAsPng, exportChartAsSvg } from '../utils/graphExport';

interface GraphEngineCardProps {
  graph: GraphCalculation;
  onChange: (updates: Partial<GraphCalculation>) => void;
}

export const GraphEngineCard: React.FC<GraphEngineCardProps> = ({ graph, onChange }) => {
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);

  // Handle Preset Selection
  const handleSelectPreset = (presetKey: string) => {
    const preset = PRESET_CALCULATIONS[presetKey];
    if (preset) {
      onChange({
        presetKey,
        inputMode: 'preset',
        title: preset.title,
        xAxisLabel: preset.xAxisLabel,
        yAxisLabel: preset.yAxisLabel,
        caption: preset.caption,
        chartType: preset.chartType,
        color: preset.color,
        data: preset.data,
      });
    }
  };

  // Recalculate values from value input
  const handleValuesChange = (rawText: string) => {
    const parsed = parseValuesInput(rawText);
    onChange({
      valuesInput: rawText,
      data: parsed.length > 0 ? parsed : graph.data,
    });
  };

  // Recalculate values from formula command
  const handleFormulaRun = (formula: string) => {
    const computed = evaluateFormulaCommand(formula, 0, 10, 1);
    if (computed.length > 0) {
      onChange({
        formulaInput: formula,
        data: computed,
      });
    }
  };

  const handleDownloadPng = async () => {
    try {
      setIsExportingPng(true);
      await exportChartAsPng('student-graph-canvas', `${graph.title.replace(/\s+/g, '_')}_300dpi.png`);
      setExportSuccessNotice('High-res PNG downloaded successfully');
      setTimeout(() => setExportSuccessNotice(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadSvg = () => {
    try {
      exportChartAsSvg('student-graph-canvas', `${graph.title.replace(/\s+/g, '_')}_vector.svg`);
      setExportSuccessNotice('Vector SVG downloaded successfully');
      setTimeout(() => setExportSuccessNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-slate-900 uppercase">
              Academic Graph & Calculation Engine
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">Card 3 • Section III Empirical Data Visualization</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-full">
          Step 3 of 3
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => onChange({ inputMode: 'preset' })}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
            graph.inputMode === 'preset'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Student Presets
        </button>
        <button
          type="button"
          onClick={() => onChange({ inputMode: 'values' })}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
            graph.inputMode === 'values'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Custom Points (X: Y)
        </button>
        <button
          type="button"
          onClick={() => onChange({ inputMode: 'formula' })}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
            graph.inputMode === 'formula'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Math Formula
        </button>
      </div>

      {/* Mode Specific Controls */}
      {graph.inputMode === 'preset' && (
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Select Empirical Benchmark Model
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(PRESET_CALCULATIONS).map((p) => {
              const isSelected = graph.presetKey === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition text-xs ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-medium shadow-2xs'
                      : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{p.chartType.toUpperCase()} • {p.data.length} data points</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {graph.inputMode === 'values' && (
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex justify-between">
            <span>Data Points (format: "X: Y" or newline pairs)</span>
            <span className="text-[10px] text-slate-500 font-normal">Auto-Parsed</span>
          </label>
          <textarea
            rows={3}
            value={graph.valuesInput}
            onChange={(e) => handleValuesChange(e.target.value)}
            placeholder={`1: 15\n2: 32\n3: 58\n4: 92\n5: 140`}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3 py-2 text-slate-900 text-xs font-mono placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition shadow-2xs"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-500">Quick inserts:</span>
            {[
              { label: 'Linear Growth', val: '10: 20\n20: 42\n30: 65\n40: 88\n50: 110' },
              { label: 'Exponential Scale', val: '2: 4\n4: 16\n8: 64\n16: 256\n32: 1024' },
              { label: 'Latency Benchmarks', val: '8: 45\n16: 78\n32: 130\n64: 215\n128: 340' },
            ].map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleValuesChange(sample.val)}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-200 transition font-medium"
              >
                + {sample.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {graph.inputMode === 'formula' && (
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex justify-between">
            <span>Mathematical Formula Command</span>
            <span className="text-[10px] text-slate-500 font-normal">Domain: x ∈ [0, 10]</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={graph.formulaInput}
              onChange={(e) => onChange({ formulaInput: e.target.value })}
              placeholder="e.g., y = 2 * x^1.6 + 10"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3 py-2 text-slate-900 text-xs font-mono placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition shadow-2xs"
            />
            <button
              type="button"
              onClick={() => handleFormulaRun(graph.formulaInput)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run</span>
            </button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-500">Quick student formulas:</span>
            {[
              'y = 35 * log(x + 1)',
              'y = 2.5 * x^1.8 + 15',
              'y = 100 / (1 + exp(-0.8 * (x - 5)))',
              'y = sin(x) * 20 + 50',
            ].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => {
                  onChange({ formulaInput: cmd });
                  handleFormulaRun(cmd);
                }}
                className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-emerald-800 border border-slate-200 px-2 py-0.5 rounded transition"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart Metadata Customizer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-700 mb-1">Figure Title</label>
          <input
            type="text"
            value={graph.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white px-2.5 py-1.5 text-slate-900 text-[11px] focus:border-amber-500 focus:bg-white focus:outline-none shadow-2xs"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-700 mb-1">X-Axis Label</label>
          <input
            type="text"
            value={graph.xAxisLabel}
            onChange={(e) => onChange({ xAxisLabel: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white px-2.5 py-1.5 text-slate-900 text-[11px] focus:border-amber-500 focus:bg-white focus:outline-none shadow-2xs"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-700 mb-1">Y-Axis Label</label>
          <input
            type="text"
            value={graph.yAxisLabel}
            onChange={(e) => onChange({ yAxisLabel: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white px-2.5 py-1.5 text-slate-900 text-[11px] focus:border-amber-500 focus:bg-white focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-semibold text-slate-700">Chart Visualization Style</span>
        <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 gap-1">
          <button
            type="button"
            onClick={() => onChange({ chartType: 'line' })}
            className={`p-1.5 rounded-md text-xs font-medium transition ${
              graph.chartType === 'line' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Line Chart"
          >
            <LineChartIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ chartType: 'area' })}
            className={`p-1.5 rounded-md text-xs font-medium transition ${
              graph.chartType === 'area' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Area Chart"
          >
            <AreaChartIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ chartType: 'bar' })}
            className={`p-1.5 rounded-md text-xs font-medium transition ${
              graph.chartType === 'bar' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Chart Preview in Card */}
      <div
        id="student-graph-canvas"
        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
      >
        <div className="text-center mb-1">
          <h4 className="text-xs font-serif font-bold text-slate-900">{graph.title}</h4>
        </div>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            {graph.chartType === 'line' ? (
              <LineChart data={graph.data} margin={{ top: 8, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="x" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  name={graph.yAxisLabel}
                  stroke={graph.color || '#d97706'}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: graph.color || '#d97706' }}
                  activeDot={{ r: 5 }}
                />
                {graph.data[0]?.baseline !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    name="Standard Baseline"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                )}
              </LineChart>
            ) : graph.chartType === 'area' ? (
              <AreaChart data={graph.data} margin={{ top: 8, right: 15, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={graph.color || '#0284c7'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={graph.color || '#0284c7'} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="x" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="y"
                  name={graph.yAxisLabel}
                  stroke={graph.color || '#0284c7'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart data={graph.data} margin={{ top: 8, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="x" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="y" name={graph.yAxisLabel} fill={graph.color || '#7c3aed'} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Caption input */}
      <div>
        <label className="block text-[10px] font-bold text-slate-700 mb-1">
          Academic Figure Caption & Notes
        </label>
        <textarea
          rows={2}
          value={graph.caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Figure 1: Measured latency validating consensus throughput..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-3 py-1.5 text-slate-900 text-xs placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none transition resize-none font-serif text-[11px] shadow-2xs"
        />
      </div>

      {exportSuccessNotice && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{exportSuccessNotice}</span>
        </div>
      )}

      {/* Action Buttons for Attest to PDF & Separate Downloads */}
      <div className="space-y-2 pt-1">
        {/* Attest to PDF Toggle Button */}
        <button
          type="button"
          onClick={() => onChange({ enabled: !graph.enabled })}
          className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border shadow-xs ${
            graph.enabled
              ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
        >
          <Paperclip className="w-4 h-4" />
          <span>
            {graph.enabled ? '✓ Attested to Academic PDF (Section III Figure)' : '➕ Attest Graph to Academic PDF'}
          </span>
        </button>

        {/* Separate Download Options (High-Res PNG & Vector SVG) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs hover:text-slate-900"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>{isExportingPng ? 'Rendering...' : 'Export High-Res PNG'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs hover:text-slate-900"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-600" />
            <span>Export Vector SVG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
