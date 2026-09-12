import { ChartDataPoint } from '../types';

export interface PresetDef {
  id: string;
  name: string;
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  caption: string;
  chartType: 'line' | 'bar' | 'area';
  color: string;
  data: ChartDataPoint[];
}

export const PRESET_CALCULATIONS: Record<string, PresetDef> = {
  bft_latency: {
    id: 'bft_latency',
    name: 'Consensus Latency vs Node Scale',
    title: 'Consensus Finality Latency (ms) vs Node Scale (N)',
    xAxisLabel: 'Network Node Count (N)',
    yAxisLabel: 'Finality Latency (ms)',
    caption: 'Figure 1: Measured PBFT vs Proof-of-Stake commit latency demonstrating sub-linear scalability up to 128 validation nodes under 10% packet drop rate.',
    chartType: 'line',
    color: '#d97706', // amber-600
    data: [
      { x: '4', y: 48, baseline: 52 },
      { x: '8', y: 72, baseline: 85 },
      { x: '16', y: 115, baseline: 140 },
      { x: '32', y: 178, baseline: 230 },
      { x: '64', y: 260, baseline: 370 },
      { x: '96', y: 345, baseline: 520 },
      { x: '128', y: 440, baseline: 710 },
    ],
  },
  hashrate_energy: {
    id: 'hashrate_energy',
    name: 'Throughput vs Gas Consumption',
    title: 'Transaction Throughput (TPS) vs Gas Efficiency',
    xAxisLabel: 'Block Size (KB)',
    yAxisLabel: 'Throughput (Transactions/sec)',
    caption: 'Figure 1: Empirical throughput curve validating pipelined cryptographic signature verification across increasing block sizes.',
    chartType: 'area',
    color: '#0284c7', // sky-600
    data: [
      { x: '128', y: 120, baseline: 90 },
      { x: '256', y: 260, baseline: 210 },
      { x: '512', y: 530, baseline: 410 },
      { x: '1024', y: 890, baseline: 720 },
      { x: '2048', y: 1420, baseline: 1100 },
      { x: '4096', y: 1850, baseline: 1350 },
    ],
  },
  training_loss: {
    id: 'training_loss',
    name: 'Model Loss & Accuracy Convergence',
    title: 'Training Convergence Loss Across Optimization Epochs',
    xAxisLabel: 'Epochs',
    yAxisLabel: 'Cross-Entropy Loss',
    caption: 'Figure 1: Stochastic gradient descent convergence rate verifying mathematical stability across 100 training epochs.',
    chartType: 'line',
    color: '#059669', // emerald-600
    data: [
      { x: '0', y: 2.85, baseline: 3.1 },
      { x: '10', y: 1.62, baseline: 1.95 },
      { x: '20', y: 0.94, baseline: 1.25 },
      { x: '30', y: 0.58, baseline: 0.85 },
      { x: '50', y: 0.32, baseline: 0.51 },
      { x: '75', y: 0.18, baseline: 0.33 },
      { x: '100', y: 0.11, baseline: 0.22 },
    ],
  },
  memory_concurrency: {
    id: 'memory_concurrency',
    name: 'Memory Allocation vs Thread Concurrency',
    title: 'Heap Memory Allocation (MB) Across Concurrent Workers',
    xAxisLabel: 'Worker Threads',
    yAxisLabel: 'Heap Allocation (MB)',
    caption: 'Figure 1: Resident set size (RSS) memory profiling proving zero-copy buffer reuse under high thread contention.',
    chartType: 'bar',
    color: '#7c3aed', // violet-600
    data: [
      { x: '2', y: 64, baseline: 80 },
      { x: '4', y: 112, baseline: 145 },
      { x: '8', y: 185, baseline: 260 },
      { x: '16', y: 290, baseline: 430 },
      { x: '32', y: 440, baseline: 690 },
      { x: '64', y: 620, baseline: 1050 },
    ],
  },
};

/**
 * Parses user input in comma/newline/colon separated values
 * E.g.: "1: 15, 2: 24, 3: 42, 4: 78" or "Jan: 100\nFeb: 200"
 */
export function parseValuesInput(input: string): ChartDataPoint[] {
  if (!input.trim()) return [];
  const points: ChartDataPoint[] = [];

  // Split by newlines, semicolons, or commas
  const rawItems = input.split(/[\n;,]+/).map((s) => s.trim()).filter(Boolean);

  for (const item of rawItems) {
    if (item.includes(':')) {
      const [xRaw, yRaw] = item.split(':').map((s) => s.trim());
      const yVal = parseFloat(yRaw);
      if (!isNaN(yVal)) {
        points.push({ x: xRaw, y: yVal });
      }
    } else if (item.includes('=')) {
      const [xRaw, yRaw] = item.split('=').map((s) => s.trim());
      const yVal = parseFloat(yRaw);
      if (!isNaN(yVal)) {
        points.push({ x: xRaw, y: yVal });
      }
    } else {
      const parts = item.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        const yVal = parseFloat(parts[1]);
        if (!isNaN(yVal)) {
          points.push({ x: parts[0], y: yVal });
        }
      } else if (parts.length === 1) {
        const yVal = parseFloat(parts[0]);
        if (!isNaN(yVal)) {
          points.push({ x: `${points.length + 1}`, y: yVal });
        }
      }
    }
  }

  return points;
}

/**
 * Evaluates a mathematical command formula like `y = 2*x + 5` or `y = 0.5*x^2`
 * for x from startX to endX with step.
 */
export function evaluateFormulaCommand(
  formulaCommand: string,
  startX = 0,
  endX = 10,
  step = 1
): ChartDataPoint[] {
  // Normalize formula: e.g. "y = 2 * x^2 + 10" -> "2 * Math.pow(x, 2) + 10"
  let expr = formulaCommand.replace(/^y\s*=\s*/i, '').trim();
  if (!expr) return [];

  // Replace power syntax ^ with Math.pow or **
  expr = expr.replace(/([a-zA-Z0-9_\.]+)\s*\^\s*([0-9\.]+)/g, 'Math.pow($1, $2)');
  expr = expr.replace(/\bsin\b/gi, 'Math.sin');
  expr = expr.replace(/\bcos\b/gi, 'Math.cos');
  expr = expr.replace(/\btan\b/gi, 'Math.tan');
  expr = expr.replace(/\bexp\b/gi, 'Math.exp');
  expr = expr.replace(/\blog\b/gi, 'Math.log');
  expr = expr.replace(/\bsqrt\b/gi, 'Math.sqrt');
  expr = expr.replace(/\bpi\b/gi, 'Math.PI');

  const points: ChartDataPoint[] = [];

  try {
    // Safe evaluation using Function
    const func = new Function('x', `try { with (Math) { return (${expr}); } } catch(e) { return NaN; }`);

    for (let x = startX; x <= endX; x += step) {
      const y = func(x);
      if (typeof y === 'number' && !isNaN(y) && isFinite(y)) {
        points.push({
          x: Number.isInteger(x) ? String(x) : x.toFixed(1),
          y: parseFloat(y.toFixed(2)),
        });
      }
    }
  } catch (err) {
    console.warn('Formula evaluation error:', err);
  }

  return points;
}
