import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
  errorColor?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({
  latex,
  displayMode = true,
  className = '',
  errorColor = '#dc2626',
}) => {
  const { html, isError, errorMessage } = useMemo(() => {
    if (!latex || !latex.trim()) {
      return { html: '', isError: false, errorMessage: '' };
    }

    try {
      const rendered = katex.renderToString(latex.trim(), {
        displayMode,
        throwOnError: false,
        errorColor,
        trust: true,
        strict: false,
      });
      return { html: rendered, isError: false, errorMessage: '' };
    } catch (err: any) {
      return {
        html: '',
        isError: true,
        errorMessage: err?.message || 'Invalid LaTeX syntax',
      };
    }
  }, [latex, displayMode, errorColor]);

  if (isError) {
    return (
      <div className={`text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg text-xs font-mono break-all ${className}`}>
        <span className="font-bold block mb-0.5">LaTeX Parse Error:</span>
        <span>{errorMessage}</span>
      </div>
    );
  }

  if (!html) {
    return (
      <span className={`italic text-slate-400 text-xs ${className}`}>
        (empty equation)
      </span>
    );
  }

  return (
    <span
      className={`katex-rendered-content ${displayMode ? 'block overflow-x-auto py-1' : 'inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
